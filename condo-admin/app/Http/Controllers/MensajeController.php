<?php

namespace App\Http\Controllers;

use App\Events\MensajeEnviado;
use App\Http\Requests\MensajeRequest;
use App\Http\Resources\MensajeResource;
use App\Models\Mensaje;
use App\Models\Solicitud;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MensajeController extends Controller
{
    /**
     * Muestra la vista de chat en vivo y mensajería del condominio.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        $mensajes = Mensaje::with(['emisor', 'receptor', 'solicitud'])
            ->orderBy('created_at', 'asc')
            ->get();

        $contactos = User::where('id', '!=', $user->id)
            ->orderBy('name')
            ->get(['id', 'name', 'email']);

        $solicitudes = Solicitud::orderByDesc('created_at')
            ->get(['id', 'asunto', 'tipo', 'estado', 'usuario_id']);

        return Inertia::render('features/mensajes/index', [
            'mensajes' => MensajeResource::collection($mensajes)->resolve(),
            'contactos' => $contactos->map(fn ($c) => [
                'id' => $c->id,
                'name' => $c->name,
                'email' => $c->email,
            ]),
            'solicitudes' => $solicitudes->map(fn ($s) => [
                'id' => $s->id,
                'asunto' => $s->asunto,
                'tipo' => $s->tipo,
                'estado' => $s->estado,
                'usuarioId' => $s->usuario_id,
            ]),
            'currentUser' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
        ]);
    }

    /**
     * Envía un mensaje y lo transmite en tiempo real vía WebSockets.
     */
    public function store(MensajeRequest $request): JsonResponse|RedirectResponse
    {
        $mensaje = Mensaje::create([
            'emisor_id' => $request->user()->id,
            'receptor_id' => $request->input('receptorId'),
            'solicitud_id' => $request->input('solicitudId'),
            'mensaje' => $request->input('mensaje'),
            'leido' => false,
        ]);

        $mensaje->load(['emisor', 'receptor', 'solicitud']);

        // Transmisión inmediata por WebSockets (Laravel Reverb)
        broadcast(new MensajeEnviado($mensaje));

        if ($request->wantsJson() || $request->ajax()) {
            return response()->json([
                'success' => true,
                'mensaje' => new MensajeResource($mensaje),
            ]);
        }

        return back();
    }

    /**
     * Marca mensajes recibidos como leídos.
     */
    public function markAsRead(Request $request): JsonResponse
    {
        $emisorId = $request->validate([
            'emisorId' => ['required', 'integer', 'exists:users,id'],
        ])['emisorId'];

        Mensaje::where('receptor_id', $request->user()->id)
            ->where('emisor_id', $emisorId)
            ->where('leido', false)
            ->update(['leido' => true]);

        return response()->json(['success' => true]);
    }

    /**
     * Eliminar un mensaje.
     */
    public function destroy(Mensaje $mensaje): RedirectResponse
    {
        $mensaje->delete();

        return back();
    }
}

