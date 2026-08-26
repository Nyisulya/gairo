import 'dotenv/config';
import readline from 'readline';

const apiKey = process.env.DEEPSEEK_API_KEY;

if (!apiKey || apiKey.trim().length < 10) {
  console.error("\n❌ Hitilafu: DEEPSEEK_API_KEY haikupatikana kwenye faili la .env!");
  process.exit(1);
}

async function askDeepSeek(userMessage) {
  process.stdout.write("🤖 AI inafikiri na kuandika...");
  try {
    const startTime = Date.now();
    const res = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey.trim()}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: "Wewe ni Mwl. Richard Lomayan, Mwalimu wa Fizikia (Physics) kutoka Gairo Secondary School. Jibu maswali kwa ufasaha wa lugha ya Kiswahili ya Kitanzania na ualimu."
          },
          {
            role: "user",
            content: userMessage
          }
        ],
        temperature: 0.7
      })
    });

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    const data = await res.json();

    // Clear loading text
    readline.clearLine(process.stdout, 0);
    readline.cursorTo(process.stdout, 0);

    if (data.choices && data.choices[0]?.message?.content) {
      console.log(`\n💬 JIBU LA MWALIMU RICHARD (DeepSeek AI) [Muda: ${duration}s]:`);
      console.log("------------------------------------------------------------------");
      console.log(data.choices[0].message.content.trim());
      console.log("------------------------------------------------------------------\n");
    } else {
      console.error("\n❌ Hitilafu ya API:", data);
    }
  } catch (err) {
    readline.clearLine(process.stdout, 0);
    readline.cursorTo(process.stdout, 0);
    console.error("\n❌ Imeshindikana kuwasiliana na AI:", err.message);
  }
}

// 1. If message passed as CLI argument (e.g. node scripts/chat-ai.js "Habari yako")
const args = process.argv.slice(2).join(" ");
if (args.trim().length > 0) {
  console.log(`\n📨 Ujumbe wako: "${args}"`);
  await askDeepSeek(args);
  process.exit(0);
}

// 2. Interactive Terminal Chat
console.log("\n=======================================================");
console.log("🎓 GAIRO SHULELINK - LIVE CHAT NA AI (MWL. RICHARD)");
console.log("=======================================================");
console.log("Andika ujumbe wowote unaotaka na ubonyeze Enter (au andika 'exit' kutoka).\n");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function promptUser() {
  rl.question("👉 Weka ujumbe wako: ", async (input) => {
    const clean = input.trim();
    if (!clean || clean.toLowerCase() === 'exit' || clean.toLowerCase() === 'toka') {
      console.log("👋 Umefunga mazungumzo na AI. Kila la heri!\n");
      rl.close();
      process.exit(0);
    }

    await askDeepSeek(clean);
    promptUser();
  });
}

promptUser();
