<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;

class CatalogController extends Controller
{
    public function categories()
    {
        return response()->json(Category::where('active', true)->withCount('products')->get());
    }

    public function products(Request $request)
    {
        $query = Product::where('available', true)->with('category');

        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->has('featured')) {
            $query->where('featured', true);
        }

        if ($request->has('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('name_fr', 'like', "%{$s}%")
                  ->orWhere('name_en', 'like', "%{$s}%")
                  ->orWhere('description_fr', 'like', "%{$s}%")
                  ->orWhere('description_en', 'like', "%{$s}%");
            });
        }

        return response()->json($query->orderBy('featured', 'desc')->get());
    }

    public function product($id)
    {
        $product = Product::with(['category', 'reviews' => function ($q) {
            $q->where('approved', true)->with('user:id,name');
        }])->findOrFail($id);

        return response()->json($product);
    }
}
