<?php

namespace App\Console\Commands;

use App\Models\Photo;
use App\Models\Prestataire;
use App\Models\Service;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class MigrateMarketplaceImages extends Command
{
    protected $signature = 'marketplace:migrate-images {--force : Overwrite existing copied files}';

    protected $description = 'Copy marketplace images from the React public folder into Laravel storage and update database paths.';

    private array $poolIndexes = [];

    public function handle(): int
    {
        $sourceDirectory = $this->resolveSourceDirectory();

        if (!$sourceDirectory) {
            $this->error("Source image directory not found: {$sourceDirectory}");

            return self::FAILURE;
        }

        $this->ensureDirectory(storage_path('app/public/prestataires'));
        $this->ensureDirectory(storage_path('app/public/services'));

        $providerPools = [
            'negafa' => ['nagafa1.jpg', 'nagafa2.jpg', 'nagafa3.jpg', 'nagafa4.jpg', 'nagafa5.jpg', 'nagafa6.jpg', 'nagafa7.jpg', 'nagafa8.jpg', 'nagafa9.jpg'],
            'photographie' => ['photographie7.jpg', 'photographie8.jpg', 'photographie9.jpg', 'photograph2.jpg'],
            'tayfer' => ['tyafar1.jpg', 'tyafar2.jpg', 'tyafar3.jpg', 'tyafar4.jpg', 'tyafar5.jpg'],
            'lieux' => ['salle11.jpg', 'salle12.jpg', 'salle2.jpg', 'salle6.jpg', 'salle7.jpg', 'salle8.jpg', 'salle9.jpg', 'image6.jpg'],
            'traiteur' => ['Traiteur3.jpg'],
            'bijoux' => ['bijoux4.jpg', 'bijoux6.jpg', 'bijoux7.jpg', 'bijoux8.jpg', 'bijoux9.jpg'],
            'hanna' => ['hanna.jpg', 'hanna1.jpg', 'hanna2.jpg', 'hanna3.jpg', 'hanna4.jpg', 'hanna8.jpg'],
            'maquillage' => ['makeup1.jpg', 'makeup3.jpg', 'makeup4.jpg', 'makeup5.jpg', 'makeup6.jpg'],
            'dj' => ['Dj.jpg'],
            'fallback' => ['hero.jpg'],
        ];

        $servicePools = [
            'Lieux de reception' => ['salle11.jpg', 'salle12.jpg', 'salle2.jpg', 'salle6.jpg', 'salle7.jpg', 'salle8.jpg', 'salle9.jpg', 'image6.jpg'],
            'Traiteur' => ['Traiteur3.jpg'],
            'Negafa' => ['nagafa1.jpg', 'nagafa2.jpg', 'nagafa3.jpg', 'nagafa4.jpg', 'nagafa5.jpg', 'nagafa6.jpg', 'nagafa7.jpg', 'nagafa8.jpg', 'nagafa9.jpg'],
            'Photographie' => ['photographie7.jpg', 'photographie8.jpg', 'photographie9.jpg', 'photograph2.jpg'],
            'DJ & Orchestre' => ['Dj.jpg'],
            'Bijoux' => ['bijoux4.jpg', 'bijoux6.jpg', 'bijoux7.jpg', 'bijoux8.jpg', 'bijoux9.jpg'],
            'Tayfer' => ['tyafar1.jpg', 'tyafar2.jpg', 'tyafar3.jpg', 'tyafar4.jpg', 'tyafar5.jpg'],
            'Hanna' => ['hanna1.jpg', 'hanna2.jpg', 'hanna3.jpg', 'hanna4.jpg', 'hanna8.jpg'],
            'Maquillage' => ['makeup3.jpg', 'makeup4.jpg', 'makeup5.jpg', 'makeup6.jpg', 'makeup1.jpg'],
            'fallback' => ['hero.jpg'],
        ];

        $copiedProviders = 0;
        $copiedServices = 0;
        $copiedPhotos = 0;

        Prestataire::query()->get()->each(function (Prestataire $prestataire) use (
            $providerPools,
            $sourceDirectory,
            &$copiedProviders
        ): void {
            $filename = $this->resolveProviderImageFilename($prestataire, $providerPools);
            $relativePath = $this->copyImageToDisk($sourceDirectory, $filename, 'prestataires');

            if ($relativePath && $prestataire->photo !== $relativePath) {
                $prestataire->forceFill(['photo' => $relativePath])->save();
                $copiedProviders++;
            }
        });

        Service::query()->get()->each(function (Service $service) use (
            $servicePools,
            $sourceDirectory,
            &$copiedServices
        ): void {
            $filename = $this->resolveServiceImageFilename($service, $servicePools);
            $relativePath = $this->copyImageToDisk($sourceDirectory, $filename, 'services');

            if ($relativePath && $service->image !== $relativePath) {
                $service->forceFill(['image' => $relativePath])->save();
                $copiedServices++;
            }
        });

        Photo::query()->get()->each(function (Photo $photo) use (
            $providerPools,
            $sourceDirectory,
            &$copiedPhotos
        ): void {
            $filename = $this->resolvePhotoFilename($photo, $providerPools);
            $relativePath = $this->copyImageToDisk($sourceDirectory, $filename, 'prestataires');

            if ($relativePath && $photo->path !== $relativePath) {
                $photo->forceFill(['path' => $relativePath])->save();
                $copiedPhotos++;
            }
        });

        $this->info("Provider images updated: {$copiedProviders}");
        $this->info("Service images updated: {$copiedServices}");
        $this->info("Provider gallery photos updated: {$copiedPhotos}");

        return self::SUCCESS;
    }

    private function resolveSourceDirectory(): ?string
    {
        $directories = [
            base_path('../frontEnd/public/image'),
            base_path('../frontEnd/public/images'),
        ];

        foreach ($directories as $directory) {
            if (File::isDirectory($directory)) {
                return $directory;
            }
        }

        return null;
    }

    private function ensureDirectory(string $directory): void
    {
        if (!File::isDirectory($directory)) {
            File::makeDirectory($directory, 0755, true);
        }
    }

    private function resolveProviderImageFilename(Prestataire $prestataire, array $pools): string
    {
        $legacyFilename = $this->extractLegacyFilename($prestataire->photo);

        if ($legacyFilename) {
            return $legacyFilename;
        }

        $name = Str::lower((string) $prestataire->nomEntreprise);

        if (Str::contains($name, ['negafa'])) {
            return $this->takeFromPool('provider-negafa', $pools['negafa']);
        }

        if (Str::contains($name, ['studio', 'photography', 'photo'])) {
            return $this->takeFromPool('provider-photographie', $pools['photographie']);
        }

        if (Str::contains($name, ['hanna', 'henna'])) {
            return $this->takeFromPool('provider-hanna', $pools['hanna']);
        }

        if (Str::contains($name, ['mequeupe', 'makeup', 'maquillage', 'beauty'])) {
            return $this->takeFromPool('provider-maquillage', $pools['maquillage']);
        }

        if (Str::contains($name, ['tayfer'])) {
            return $this->takeFromPool('provider-tayfer', $pools['tayfer']);
        }

        if (Str::contains($name, ['traiteur'])) {
            return $this->takeFromPool('provider-traiteur', $pools['traiteur']);
        }

        if (Str::contains($name, ['bijoux'])) {
            return $this->takeFromPool('provider-bijoux', $pools['bijoux']);
        }

        if (Str::contains($name, ['dj', 'orchestre'])) {
            return $this->takeFromPool('provider-dj', $pools['dj']);
        }

        if (Str::contains($name, ['palais', 'villa', 'riad', 'jardin', 'events', 'reception'])) {
            return $this->takeFromPool('provider-lieux', $pools['lieux']);
        }

        return $this->takeFromPool('provider-fallback', $pools['fallback']);
    }

    private function resolveServiceImageFilename(Service $service, array $pools): string
    {
        $legacyFilename = $this->extractLegacyFilename($service->image);

        if ($legacyFilename) {
            return $legacyFilename;
        }

        $serviceName = Str::lower((string) $service->name);
        $providerName = Str::lower((string) optional($service->prestataire)->nomEntreprise);

        if (Str::contains($serviceName, ['hanna', 'henna']) || Str::contains($providerName, ['hanna', 'henna'])) {
            return $this->takeFromPool('service-hanna', $pools['Hanna']);
        }

        if (
            Str::contains($serviceName, ['makeup', 'maquillage', 'beauty', 'glam']) ||
            Str::contains($providerName, ['mequeupe', 'makeup', 'maquillage', 'beauty'])
        ) {
            return $this->takeFromPool('service-maquillage', $pools['Maquillage']);
        }

        $category = $service->category;

        if (isset($pools[$category])) {
            return $this->takeFromPool("service-{$category}", $pools[$category]);
        }

        return $this->takeFromPool('service-fallback', $pools['fallback']);
    }

    private function resolvePhotoFilename(Photo $photo, array $pools): string
    {
        $legacyFilename = $this->extractLegacyFilename($photo->path);

        if ($legacyFilename) {
            return $legacyFilename;
        }

        $provider = $photo->prestataire;

        if ($provider) {
            return $this->resolveProviderImageFilename($provider, $pools);
        }

        return $this->takeFromPool('photo-fallback', $pools['fallback']);
    }

    private function extractLegacyFilename(?string $path): ?string
    {
        if (!$path) {
            return null;
        }

        $filename = basename($path);
        $sourceDirectory = $this->resolveSourceDirectory();

        if (!$sourceDirectory) {
            return null;
        }

        $sourcePath = $sourceDirectory . DIRECTORY_SEPARATOR . $filename;

        return File::exists($sourcePath) ? $filename : null;
    }

    private function takeFromPool(string $poolKey, array $filenames): string
    {
        $index = $this->poolIndexes[$poolKey] ?? 0;
        $filename = $filenames[$index % count($filenames)];
        $this->poolIndexes[$poolKey] = $index + 1;

        return $filename;
    }

    private function copyImageToDisk(string $sourceDirectory, string $filename, string $targetDirectory): ?string
    {
        $sourcePath = $sourceDirectory . DIRECTORY_SEPARATOR . $filename;

        if (!File::exists($sourcePath)) {
            $this->warn("Missing source image: {$filename}");

            return null;
        }

        $destinationPath = storage_path('app/public/' . $targetDirectory . '/' . $filename);

        if ($this->option('force') || !File::exists($destinationPath)) {
            File::copy($sourcePath, $destinationPath);
        }

        return $targetDirectory . '/' . $filename;
    }
}
