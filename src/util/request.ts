import { json, validateRequest, verifySignature } from "deps.ts";

export async function validateRequestSignature(request: Request, publicKey: string) {
  const { error } = await validateRequest(request, {
    POST: {
      headers: ["X-Signature-Ed25519", "X-Signature-Timestamp"],
    },
  });

  if (error) {
    return [json({ error: error.message }, { status: error.status }), null] as const;
  }

  const signature = request.headers.get("X-Signature-Ed25519")!;
  const timestamp = request.headers.get("X-Signature-Timestamp")!;
  const { body, isValid } = verifySignature({
    publicKey,
    signature,
    timestamp,
    body: await request.text(),
  });

  if (!isValid) {
    return [
      json({ error: "Invalid request; could not verify the request" }, {
        status: 401,
      }),
      null,
    ] as const;
  }

  return [null, body] as const;
}
