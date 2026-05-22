<?php

namespace App\Http\Requests\Avis;

use Illuminate\Foundation\Http\FormRequest;

class StoreAvisRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'service_id' => ['required', 'exists:services,id'],
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'comment' => ['nullable', 'string'],
        ];
    }
}
