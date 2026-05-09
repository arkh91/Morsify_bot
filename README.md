# Morsify Telegram Bot

Morsify is a Telegram bot designed for Morse Code translation and communication.  
The bot can encode normal text into Morse Code and decode Morse Code back into readable text.

---

# Features

- Text to Morse Code translation
- Morse Code to text translation
- Telegram bot integration
- Express server support
- MySQL database support
- API support with Axios
- Easy deployment on Ubuntu/Linux servers

---

# Project Structure

```bash
.
├── Initializing.sh
├── README.md
├── main.js
├── tokens.js
├── package.json
└── node_modules/
```

File Descriptions
Initializing.sh

Initialization and setup script.

- Responsibilities
- Installs dependencies
- Prepares the environment
- Configures permissions
- Starts required services

  Usage
```
bash Initializing.sh
```

Run Manually
```
node main.js
```

tokens.js

Stores sensitive configuration values.

Example
```
module.exports = {
    telegramToken: "YOUR_TELEGRAM_BOT_TOKEN",
    dbPassword: "YOUR_DATABASE_PASSWORD"
};
```

