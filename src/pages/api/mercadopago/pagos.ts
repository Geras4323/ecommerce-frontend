import { getMercadoPagoPayment } from "@/functions/mercadopago";
import { vars } from "@/utils/vars";
import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const body = req.body;
    // console.log(req.headers["x-signature"]);
    // console.log(body);

    const mpPayment = await getMercadoPagoPayment(body.data.id);
    // console.log("payment :", mpPayment);
    // console.log("payment :", mpPayment.metadata);

    const dbPayment = await axios.post(
      `${vars.serverUrl}/api/v1/payments/mercadopago/add`,
      {
        orderID: mpPayment.metadata.order_id,
        paymentID: mpPayment.id,
        payed: mpPayment.transaction_details?.total_paid_amount,
        received: mpPayment.transaction_details?.net_received_amount,
      },
      { withCredentials: true }
    );

    // Respond immediately
    res.status(200).json({ message: "Webhook received successfully" });
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}
