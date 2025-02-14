export async function getAIcontent(promt: string) {
  const res = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyCsY_W1nReODA7ylUQpEoF3hC8x7na4wjA",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: promt }],
          },
        ],
      }),
    }
  );

  const data: any = await res.json();
  return data.candidates[0].content.parts[0].text;
}
