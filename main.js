// ─────────────────────────────────────────────────────────────────────────────
//  main.js  –  Morsify Telegram Bot
// ─────────────────────────────────────────────────────────────────────────────

const axios   = require('axios');
const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const db      = require('./db');
const mysql   = require('mysql');
const fs      = require('fs');
const https   = require('https');
const tokens  = require('./tokens');

console.log("✅ MySQL module loaded successfully");

// ───── Load / watch callbacks.json ───────────────────────────────────────
let callbackToServer = {};
let callbackToInternationalServer = {};

function loadConfig() {
    const raw = fs.readFileSync('./callbacks.json');
    const config = JSON.parse(raw);

    callbackToServer = config.callbackToServer;
    callbackToInternationalServer = config.callbackToInternationalServer;

    console.log('✅ Callbacks loaded');
}

loadConfig();

fs.watchFile('./callbacks.json', { interval: 2000 }, () => {
    try {
        console.log('⚡ callbacks.json updated, reloading...');
        loadConfig();
    } catch (err) {
        console.error('❌ Failed to reload callbacks.json:', err);
    }
});

// ───── Bot initialisation ─────────────────────────────────────────────────
const bot = new TelegramBot(tokens.royalDNS, {
    polling: {
        interval: 300,
        autoStart: true,
        params: { timeout: 10 }
    }
});

// ─────────────────────────────────────────────────────────────────────────────
//  Morse Code Translator
// ─────────────────────────────────────────────────────────────────────────────

const morseCode = {
    A: '.-',     B: '-...',   C: '-.-.',
    D: '-..',    E: '.',      F: '..-.',
    G: '--.',    H: '....',   I: '..',
    J: '.---',   K: '-.-',    L: '.-..',
    M: '--',     N: '-.',     O: '---',
    P: '.--.',   Q: '--.-',   R: '.-.',
    S: '...',    T: '-',      U: '..-',
    V: '...-',   W: '.--',    X: '-..-',
    Y: '-.--',   Z: '--..',

    0: '-----',  1: '.----',  2: '..---',
    3: '...--',  4: '....-',  5: '.....',
    6: '-....',  7: '--...',  8: '---..',
    9: '----.',

    '.': '.-.-.-',
    ',': '--..--',
    '?': '..--..',
    '!': '-.-.--',
    '/': '-..-.',
    '(': '-.--.',
    ')': '-.--.-',
    '&': '.-...',
    ':': '---...',
    ';': '-.-.-.',
    '=': '-...-',
    '+': '.-.-.',
    '-': '-....-',
    '_': '..--.-',
    '"': '.-..-.',
    '$': '...-..-',
    '@': '.--.-.',
    "'": '.----.',
    ' ': '/'
};

// Reverse lookup table
const reverseMorseCode = {};

for (const key in morseCode) {
    reverseMorseCode[morseCode[key]] = key;
}

// ─────────────────────────────────────────────────────────────────────────────
//  Detect Morse Code
// ─────────────────────────────────────────────────────────────────────────────

function isMorseCode(text) {
    return /^[.\-/\s]+$/.test(text.trim());
}

// ─────────────────────────────────────────────────────────────────────────────
//  English → Morse
// ─────────────────────────────────────────────────────────────────────────────

function textToMorse(text) {
    return text
        .toUpperCase()
        .split('')
        .map(char => morseCode[char] || '')
        .join(' ');
}

// ─────────────────────────────────────────────────────────────────────────────
//  Morse → English
// ─────────────────────────────────────────────────────────────────────────────

function morseToText(morse) {
    return morse
        .split(' / ')
        .map(word =>
            word
                .split(' ')
                .map(code => reverseMorseCode[code] || '')
                .join('')
        )
        .join(' ');
}

// ─────────────────────────────────────────────────────────────────────────────
//  Message Handler
// ─────────────────────────────────────────────────────────────────────────────

bot.on('message', async (msg) => {

    // Ignore commands
    if (!msg.text || msg.text.startsWith('/')) return;

    const chatId = msg.chat.id;
    const text = msg.text.trim();

    try {

        let reply = '';

        if (isMorseCode(text)) {

            // Morse → English
            reply = morseToText(text);

        } else {

            // English → Morse
            reply = textToMorse(text);

        }

        if (!reply || reply.trim() === '') {
            reply = '❌ Unable to translate.';
        }

        await bot.sendMessage(chatId, reply, {
            reply_to_message_id: msg.message_id
        });

    } catch (err) {

        console.error('❌ Translation error:', err);

        await bot.sendMessage(chatId, '❌ Error processing translation.', {
            reply_to_message_id: msg.message_id
        });
    }
});

console.log('✅ Morsify Bot Started');
