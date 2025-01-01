import { type ServerSuccess } from "@/types/types";
import { vars } from "@/utils/vars";
import axios from "axios";
import MercadoPagoConfig, { Payment } from "mercadopago";
import { type PreferenceResponse } from "mercadopago/dist/clients/preference/commonTypes";

export type MPProduct = {
  id: number;
  name: string;
  quantity: number;
  price: number;
};

const mercadopago = !!vars.mp_access_token // with this nothing will explode if the access token was not set (see lines 27 & 66)
  ? new MercadoPagoConfig({
      accessToken: vars.mp_access_token,
    })
  : undefined;

export async function generateMercadopagoPayment({
  paymentID,
  items,
}: {
  paymentID: number;
  items: MPProduct[];
}) {
  if (!mercadopago) return;
  const response: ServerSuccess<PreferenceResponse> = await axios.post(
    "https://api.mercadopago.com/checkout/preferences",
    {
      // items: [
      //   {
      //     id: "payment",
      //     title: "Compra Test",
      //     quantity: 1,
      //     unit_price: 20,
      //   },
      //   {
      //     id: "payment 2",
      //     title: "Compra Test 2",
      //     quantity: 1,
      //     unit_price: 10,
      //   },
      // ],
      items: items.map((item) => ({
        id: item.id,
        title: item.name,
        quantity: item.quantity,
        unit_price: item.price,
      })),
      metadata: {
        paymentID,
      },
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${mercadopago.accessToken}`,
      },
    }
  );
  if (response.data.init_point) return response.data.init_point;
}

export async function getMercadoPagoPayment(paymentID: string) {
  if (!mercadopago) return;
  const payment = await new Payment(mercadopago).get({ id: paymentID });
  return payment;
}
