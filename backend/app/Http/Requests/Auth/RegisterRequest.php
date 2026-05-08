<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name'        => 'required|string|max:100',
            'email'       => 'required|email|unique:mongodb.users,email',
            'password'    => 'required|string|min:8|confirmed',
            'role'        => 'required|in:donor,hospital,blood_bank',
            'phone'       => 'nullable|string|max:20',
            'city'        => 'nullable|string|max:64',
            'blood_group' => 'nullable|in:A+,A-,B+,B-,O+,O-,AB+,AB-',
        ];
    }

    public function messages(): array
    {
        return [
            'email.unique'         => 'An account with this email already exists.',
            'password.min'         => 'Password must be at least 8 characters.',
            'role.in'              => 'Role must be one of: donor, hospital, blood_bank.',
            'blood_group.in'       => 'Invalid blood group provided.',
        ];
    }
}
