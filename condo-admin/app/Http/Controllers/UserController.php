<?php

namespace App\Http\Controllers;

use App\Http\Requests\UserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * Show the list of residents and tenants.
     */
    public function index(): Response
    {
        $users = User::with('locales')->orderBy('name')->get();

        return Inertia::render('userList', [
            'users' => UserResource::collection($users)->resolve(),
        ]);
    }

    /**
     * Register a new user from the administration panel.
     */
    public function store(UserRequest $request): RedirectResponse
    {
        User::create([
            ...$request->userAttributes(),
            // El usuario puede definir su contraseña con "¿Olvidaste tu contraseña?"
            'password' => Str::password(32),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Usuario registrado.']);

        return to_route('users.index');
    }

    /**
     * Update a user's contact data and status.
     */
    public function update(UserRequest $request, User $user): RedirectResponse
    {
        $datos = $request->userAttributes();

        if ($user->is($request->user())) {
            // Nadie puede bloquearse a sí mismo.
            $datos['activo'] = true;
        }

        $user->fill($datos);

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => "Usuario {$user->name} actualizado."]);

        return to_route('users.index');
    }

    /**
     * Delete a user without related records.
     */
    public function destroy(Request $request, User $user): RedirectResponse
    {
        if ($user->is($request->user())) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'No puedes eliminar tu propia cuenta desde aquí; usa Configuración > Perfil.',
            ]);

            return to_route('users.index');
        }

        if (! $this->deleteUser($user)) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => "{$user->name} tiene registros asociados (pagos, incidencias, etc.). Bloquéalo en lugar de eliminarlo.",
            ]);

            return to_route('users.index');
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => "Usuario {$user->name} eliminado."]);

        return to_route('users.index');
    }

    /**
     * Delete the selected users, skipping the current user and those with related records.
     */
    public function destroyMany(Request $request): RedirectResponse
    {
        $ids = $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['integer', 'exists:users,id'],
        ])['ids'];

        $users = User::whereKey($ids)->whereKeyNot($request->user()?->id)->get();
        $noEliminados = $users->reject(fn (User $user) => $this->deleteUser($user));
        $eliminados = $users->count() - $noEliminados->count();

        $mensaje = "Se eliminaron {$eliminados} usuarios.";

        if ($noEliminados->isNotEmpty()) {
            $mensaje .= ' No se eliminaron '.$noEliminados->pluck('name')->join(', ').' porque tienen registros asociados.';
        }

        Inertia::flash('toast', ['type' => $noEliminados->isEmpty() ? 'success' : 'warning', 'message' => $mensaje]);

        return to_route('users.index');
    }

    /**
     * Block or unblock the selected users (never the current user).
     */
    public function updateStatus(Request $request): RedirectResponse
    {
        $datos = $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['integer', 'exists:users,id'],
            'active' => ['required', 'boolean'],
        ]);

        $activo = $request->boolean('active');

        $actualizados = User::whereKey($datos['ids'])
            ->whereKeyNot($request->user()?->id)
            ->update(['activo' => $activo]);

        $accion = $activo ? 'desbloquearon' : 'bloquearon';

        Inertia::flash('toast', ['type' => 'success', 'message' => "Se {$accion} {$actualizados} usuarios."]);

        return to_route('users.index');
    }

    /**
     * Delete the user unless payments, incidents, etc. still reference it.
     */
    private function deleteUser(User $user): bool
    {
        if ($user->tieneRegistrosAsociados()) {
            return false;
        }

        return (bool) $user->delete();
    }
}
