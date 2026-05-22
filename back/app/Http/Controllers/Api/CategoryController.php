<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;

class CategoryController extends Controller
{
    public function index()
    {
        $categories = Category::query()
            ->withCount('services')
            ->orderByDesc('services_count')
            ->orderBy('name')
            ->get()
            ->map(fn (Category $category) => [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
                'image' => $category->image_url,
                'services_count' => $category->services_count,
            ])
            ->values();

        return response()->json([
            'success' => true,
            'data' => $categories,
        ]);
    }
}
