import { MercadoPagoConfig, Preference } from 'mercadopago';

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { items } = req.body;

    const preference = new Preference(client);
    const response = await preference.create({
      body: {
        items: items.map((item) => ({
          title: item.nombre,
          quantity: item.cantidad,
          unit_price: item.precio,
          currency_id: 'MXN',
        })),
        back_urls: {
          success: `${process.env.VITE_APP_URL}/carrito?status=success`,
          failure: `${process.env.VITE_APP_URL}/carrito?status=failure`,
          pending: `${process.env.VITE_APP_URL}/carrito?status=pending`,
        },
        auto_return: 'approved',
      },
    });

    res.status(200).json({ id: response.id, init_point: response.init_point });
  } catch (error) {
    console.error('Error creating preference:', error);
    res.status(500).json({ error: 'Error al crear preferencia de pago' });
  }
}