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
    // console.log("signature: ", req.headers["x-signature"]);
    // console.log("body: ", body);

    const mpPayment = await getMercadoPagoPayment(body.data.id);
    // console.log("payment: ", mpPayment);
    // console.log("payment metadata: ", mpPayment.metadata);

    if (!mpPayment) return;

    try {
      await axios.post(
        `${vars.serverUrl}/api/v1/payments/mercadopago/${mpPayment.metadata.payment_id}/end`, // metadata "paymentID" is turned into "payment_id" by MP
        {
          paymentNumber: mpPayment.id,
          paid: mpPayment.transaction_details?.total_paid_amount,
          received: mpPayment.transaction_details?.net_received_amount,
          status: mpPayment.status === "approved" ? "accepted" : "rejected",
        },
        { withCredentials: true }
      );
    } catch (err) {
      console.error(err);
    }

    // Respond immediately
    res.status(200).json({ message: "Webhook received successfully" });
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}
