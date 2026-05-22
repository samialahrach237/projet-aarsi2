<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Service\StoreServiceRequest;
use App\Http\Requests\Service\UpdateServiceRequest;
use App\Models\Category;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ServiceController extends Controller
{
    protected function serviceRelations(): array
    {
        return [
            'categoryModel:id,name,slug',
            'prestataire' => fn ($query) => $query->select(
                'user_id',
                'nomEntreprise',
                'slug',
                'description',
                'adresse',
                'ville',
                'photo',
                'is_validated'
            ),
            'prestataire.user:id,name,city',
            'prestataire.photos:id,prestataire_id,path',
        ];
    }

    protected function baseMarketplaceQuery()
    {
        return Service::query()
            ->select([
                'id',
                'prestataire_id',
                'category_id',
                'name',
                'description',
                'price',
                'duration',
                'category',
                'image',
            ])
            ->with($this->serviceRelations())
            ->withCount('avis')
            ->withAvg('avis', 'rating')
            ->whereHas('prestataire', fn ($query) => $query->where('is_validated', true));
    }

    protected function providerServiceQuery(int $prestataireId)
    {
        return Service::query()
            ->select([
                'id',
                'prestataire_id',
                'category_id',
                'name',
                'description',
                'price',
                'duration',
                'category',
                'image',
            ])
            ->with($this->serviceRelations())
            ->withCount([
                'reservations',
                'reservations as accepted_reservations_count' => fn ($query) => $query->where('status', 'accepted'),
            ])
            ->withCount('avis')
            ->withAvg('avis', 'rating')
            ->where('prestataire_id', $prestataireId)
            ->orderByDesc('id');
    }

    protected function resolveCategory(?string $name, ?int $id): ?Category
    {
        if ($id) {
            return Category::find($id);
        }

        if (!$name) {
            return null;
        }

        return Category::firstOrCreate(
            ['slug' => Str::slug($name)],
            ['name' => $name]
        );
    }

    protected function applyMarketplaceFilters($query, Request $request): void
    {
        if ($request->filled('category')) {
            $category = $request->string('category')->toString();

            $query->where(function ($serviceQuery) use ($category) {
                $serviceQuery
                    ->where('category', $category)
                    ->orWhereHas('categoryModel', fn ($categoryQuery) => $categoryQuery->where('slug', $category));
            });
        }

        if ($request->filled('city')) {
            $city = $request->string('city')->toString();

            $query->whereHas('prestataire', function ($prestataireQuery) use ($city) {
                $prestataireQuery
                    ->where('ville', 'like', '%' . $city . '%')
                    ->orWhere('adresse', 'like', '%' . $city . '%');
            });
        }

        if ($request->filled('provider')) {
            $provider = $request->string('provider')->toString();

            $query->whereHas('prestataire', function ($prestataireQuery) use ($provider) {
                $prestataireQuery->where('nomEntreprise', 'like', '%' . $provider . '%');
            });
        }

        if ($request->filled('q')) {
            $keyword = $request->string('q')->toString();

            $query->where(function ($serviceQuery) use ($keyword) {
                $serviceQuery
                    ->where('name', 'like', '%' . $keyword . '%')
                    ->orWhere('description', 'like', '%' . $keyword . '%')
                    ->orWhereHas('prestataire', fn ($prestataireQuery) => $prestataireQuery
                        ->where('nomEntreprise', 'like', '%' . $keyword . '%')
                        ->orWhere('ville', 'like', '%' . $keyword . '%')
                    );
            });
        }

        if ($request->filled('min_price')) {
            $query->where('price', '>=', (float) $request->get('min_price'));
        }

        if ($request->filled('max_price')) {
            $query->where('price', '<=', (float) $request->get('max_price'));
        }

        if ($request->filled('prestataire_id')) {
            $query->where('prestataire_id', $request->integer('prestataire_id'));
        }
    }

    protected function transformCard(Service $service): array
    {
        $city = $service->prestataire?->ville
            ?: $service->prestataire?->user?->city
            ?: $service->prestataire?->adresse;

        return [
            'id' => $service->id,
            'name' => $service->name,
            'description' => $service->description,
            'price' => (float) $service->price,
            'duration' => $service->duration,
            'image' => $service->image_url,
            'provider' => [
                'id' => $service->prestataire?->user_id,
                'name' => $service->prestataire?->nomEntreprise ?: $service->prestataire?->user?->name,
                'slug' => $service->prestataire?->slug,
                'city' => $city,
                'address' => $service->prestataire?->adresse,
                'photo' => $service->prestataire?->photo_url,
            ],
            'category' => [
                'id' => $service->categoryModel?->id,
                'name' => $service->categoryModel?->name ?: $service->category,
                'slug' => $service->categoryModel?->slug ?: Str::slug((string) $service->category),
            ],
            'rating' => round((float) ($service->avis_avg_rating ?? 0), 1),
            'reviews_count' => $service->avis_count,
        ];
    }

    protected function transformDetail(Service $service): array
    {
        $providerGallery = $service->prestataire?->photos?->pluck('url')->all() ?? [];

        $gallery = collect([
            $service->image_url,
            ...$providerGallery,
        ])->filter()->unique()->values();

        $availability = $service->prestataire?->calendriers()
            ->where('available', false)
            ->whereDate('date', '>=', now()->toDateString())
            ->orderBy('date')
            ->limit(12)
            ->get(['date'])
            ->map(fn ($item) => $item->date?->toDateString())
            ->values();

        return [
            ...$this->transformCard($service),
            'prestataire_id' => $service->prestataire_id,
            'gallery' => $gallery,
            'reviews' => $service->avis->map(fn ($avis) => [
                'id' => $avis->id,
                'rating' => $avis->rating,
                'comment' => $avis->comment,
                'client_name' => $avis->client?->user?->name,
                'created_at' => optional($avis->created_at)->toDateString(),
            ])->values(),
            'availability' => [
                'unavailable_dates' => $availability,
            ],
        ];
    }

    public function myServices(Request $request)
    {
        $prestataireId = $request->user()->prestataire?->user_id;

        if (!$prestataireId) {
            return response()->json([
                'success' => false,
                'message' => 'Prestataire profile not found.',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $this->providerServiceQuery($prestataireId)->get()->map(
                fn (Service $service) => $this->transformCard($service)
            )->values(),
        ]);
    }

    public function providerIndex(Request $request)
    {
        return $this->myServices($request);
    }

    public function index(Request $request)
    {
        $query = $this->baseMarketplaceQuery()->latest('id');
        $this->applyMarketplaceFilters($query, $request);

        $services = $query->paginate((int) $request->get('per_page', 12))->through(
            fn (Service $service) => $this->transformCard($service)
        );

        return response()->json([
            'success' => true,
            'data' => $services,
        ]);
    }

    public function search(Request $request)
    {
        return $this->index($request);
    }

    public function show(Service $service)
    {
        $service->load([
            ...$this->serviceRelations(),
            'prestataire.calendriers:id,prestataire_id,date,available',
            'avis' => fn ($query) => $query
                ->select('id', 'client_id', 'service_id', 'rating', 'comment', 'created_at')
                ->latest(),
            'avis.client.user:id,name',
        ])->loadCount('avis')->loadAvg('avis', 'rating');

        return response()->json([
            'success' => true,
            'data' => $this->transformDetail($service),
        ]);
    }

    public function store(StoreServiceRequest $request)
    {
        $prestataire = $request->user()->prestataire;

        if (!$prestataire) {
            return response()->json([
                'success' => false,
                'message' => 'Prestataire profile not found.',
            ], 403);
        }

        if (!$prestataire->is_validated) {
            return response()->json([
                'success' => false,
                'message' => 'Prestataire not validated yet.',
            ], 403);
        }

        $category = $this->resolveCategory($request->category, $request->integer('category_id'));

        $service = Service::create([
            'prestataire_id' => $prestataire->user_id,
            'category_id' => $category?->id,
            'name' => $request->name,
            'description' => $request->description,
            'price' => $request->price,
            'duration' => $request->duration,
            'category' => $category?->name ?: $request->category,
            'image' => $request->hasFile('image')
                ? $request->file('image')->store('services', 'public')
                : null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Service created.',
            'data' => $this->transformCard($service->load($this->serviceRelations())->loadCount('avis')->loadAvg('avis', 'rating')),
        ], 201);
    }

    public function update(UpdateServiceRequest $request, Service $service)
    {
        $prestataire = $request->user()->prestataire;

        if (!$prestataire || $service->prestataire_id !== $prestataire->user_id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized.',
            ], 403);
        }

        $data = $request->validated();

        if ($request->has('category') || $request->has('category_id')) {
            $category = $this->resolveCategory($request->category, $request->integer('category_id'));
            $data['category_id'] = $category?->id;
            $data['category'] = $category?->name ?: $request->category;
        }

        if ($request->hasFile('image')) {
            if ($service->image) {
                Storage::disk('public')->delete($service->image);
            }

            $data['image'] = $request->file('image')->store('services', 'public');
        }

        $service->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Service updated.',
            'data' => $this->transformCard($service->fresh()->load($this->serviceRelations())->loadCount('avis')->loadAvg('avis', 'rating')),
        ]);
    }

    public function destroy(Request $request, Service $service)
    {
        $user = $request->user();
        $prestataire = $user->prestataire;

        if (($prestataire && $service->prestataire_id === $prestataire->user_id) || $user->role === 'admin') {
            if ($service->image) {
                Storage::disk('public')->delete($service->image);
            }

            $service->delete();

            return response()->json([
                'success' => true,
                'message' => 'Service deleted.',
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Unauthorized.',
        ], 403);
    }
}
