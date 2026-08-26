import 'dotenv/config';

const apiKey = process.env.DEEPSEEK_API_KEY;

console.log("\n=======================================================");
console.log("🔍 GAIRO SHULELINK - DEEPSEEK VISION AI HEALTH CHECK");
console.log("=======================================================");

if (!apiKey || apiKey.trim().length < 10) {
  console.error("❌ Hitilafu: DEEPSEEK_API_KEY haikupatikana kwenye faili la .env!");
  console.log("👉 Tafadhali weka DEEPSEEK_API_KEY=sk-... kwenye .env yako.\n");
  process.exit(1);
}

console.log(`✅ API Key imepatikana: ${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`);
console.log("📡 Inatuma ombi la jaribio la picha kwenda DeepSeek Vision...");

const sampleImage = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAAyADIDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD5/ooooAKKKKACiiigD//Z";

try {
  const startTime = Date.now();
  const res = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey.trim()}`
    },
    body: JSON.stringify({
      model: "deepseek-v4-flash-vision-exp",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Habari! Hii ni picha ya jaribio ya mfumo wa Fizikia wa Gairo Secondary School. Jibu kwa Kiswahili kifupi kuthibitisha kuwa AI ipo tayari kusahihisha." },
            { type: "image_url", image_url: { url: sampleImage } }
          ]
        }
      ],
      temperature: 0.1
    })
  });

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  const data = await res.json();

  if (data.choices && data.choices[0]?.message?.content) {
    console.log(`\n🎉 HONGERA! DeepSeek Vision AI inafanya kazi 100% (Muda: ${duration}s)!`);
    console.log("-------------------------------------------------------");
    console.log("Jibu la AI:", data.choices[0].message.content.trim());
    console.log("-------------------------------------------------------\n");
    process.exit(0);
  } else {
    console.error("\n❌ Hitilafu kutoka DeepSeek API:", data);
    process.exit(1);
  }
} catch (err) {
  console.error("\n❌ Imeshindikana kuwasiliana na DeepSeek Vision:", err.message);
  process.exit(1);
}
