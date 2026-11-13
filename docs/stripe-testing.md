# Probar pagos con Stripe (modo test)

## 1. Requisitos

En `.env` (claves de **test**, no live):

```bash
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
# Opcional en local: `stripe listen` imprime este valor
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Reinicia el dev server después de cambiar `.env`:

```bash
pnpm dev
```

Comprueba que Stripe está activo (no simulado): en `/dashboard/billing` no debe
aparecer el aviso de simulación.

## 2. Flujo de pago (sin Stripe CLI)

1. Inicia sesión y abre `http://localhost:3000/dashboard/billing`.
2. Pulsa **Pay with Stripe** en un paquete (30, 60 o 90 clases).
3. En la página de Stripe Checkout usa una tarjeta de prueba:

| Tarjeta             | Resultado                                  |
| ------------------- | ------------------------------------------ |
| `4242 4242 4242 4242` | Pago correcto (Visa)                     |
| `5555 5555 5555 4444` | Pago correcto (Mastercard)               |
| `3782 822463 10005`   | Pago correcto (American Express)        |
| `4000 0025 0000 3155` | Requiere autenticación 3D Secure        |
| `4000 0000 0000 3220` | Fuerza 3D Secure 2                      |
| `4000 0000 0000 9995` | Rechazada: fondos insuficientes         |
| `4000 0000 0000 0002` | Rechazada: declinación genérica         |

- Fecha: cualquier mes/año futuro (por ejemplo `12 / 34`).
- CVC: cualquier 3 dígitos (4 para Amex).
- Código postal: cualquiera (por ejemplo `10001`).
- Nombre y país: cualquiera.

Al terminar, Stripe redirige a
`/api/billing/stripe/return?session_id=...`. Esa ruta verifica la sesión
directamente con la API de Stripe, marca el pago como `succeeded` y concede los
créditos. **No necesitas webhook para probar en local.** El webhook sigue siendo
la fuente de verdad en producción y el proceso es idempotente.

## 3. Flujo con webhook (recomendado para probar producción)

Instala la CLI de Stripe y reenvía eventos al endpoint local:

```bash
stripe login
stripe listen --forward-to localhost:3000/api/billing/stripe/webhook
```

La CLI imprime un secreto `whsec_...`. Cópialo en `.env` como
`STRIPE_WEBHOOK_SECRET` y reinicia `pnpm dev`.

> El secreto de `stripe listen` es distinto del que muestra el dashboard en
> **Developers → Webhooks**. Si cambias de uno a otro, actualiza `.env`.

Para comprobar solo la firma del webhook:

```bash
stripe trigger checkout.session.completed
```

Ese evento de prueba no lleva el `metadata.paymentId` de la app, así que no
concede créditos; sirve para verificar que la firma se valida (HTTP 200).

## 4. Verificar el resultado

- En `/dashboard/billing`, la tabla **Payment history** debe mostrar el pago como
  `succeeded` y el paquete comprado.
- El saldo de clases se actualiza en la wallet familiar
  (`family_class_credits`) y queda registrado en `credit_ledger`.
- Para inspeccionar la base de datos: `pnpm db:studio`.

## 5. Tarjetas guardadas / errores comunes

- `401 Unauthorized`: la sesión expiró; vuelve a iniciar sesión.
- `503 Stripe checkout failed`: revisa que `STRIPE_SECRET_KEY` sea `sk_test_...`
  y que el servidor se haya reiniciado tras editar `.env`.
- `Payment error: invalid_session`: el `session_id` no pertenece al usuario
  autenticado o el pago se intentó finalizar desde otra cuenta.
- La página queda en `pending`: el método de pago es asíncrono; el webhook
  `checkout.session.async_payment_succeeded` lo confirmará.
