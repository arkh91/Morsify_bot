// ─────────────────────────────────────────────────────────────────────────────
//  main.js  –  Morsify Telegram Bot
// ─────────────────────────────────────────────────────────────────────────────

const axios   = require('axios');
const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const db      = require('./db');
const fs      = require('fs');
const https   = require('https');
const tokens  = require('./tokens');

console.log("✅ MySQL module loaded successfully");


// ───── Bot initialisation ─────────────────────────────────────────────────
const bot = new TelegramBot(tokens.Morsify, {
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

// ─────────────────────────────────────────────
// /start command
// ─────────────────────────────────────────────

bot.onText(/\/start/, async (msg) => {

    console.log('✅ /start triggered');

    const chatId = msg.chat.id;

    const userId    = msg.from.id;
    const firstName = msg.from.first_name || 'User';
    const lastName  = msg.from.last_name || '';
    const username  = msg.from.username || '';

   // console.log({
     //   userId,
     //   firstName,
     //   lastName,
     //   username
    //});

    db.query(
        'SELECT UserID FROM accounts WHERE UserID = ?',
        [userId],
        (selectErr, results) => {

            if (selectErr) {

                console.error('SELECT ERROR:', selectErr);

                return bot.sendMessage(
                    chatId,
                    '❌ Database select error.'
                );
            }

            console.log('SELECT RESULTS:', results);

            // User does not exist
            if (results.length === 0) {

                console.log('⚡ Inserting new user...');

                db.query(
                    `INSERT INTO accounts
                    (UserID, FirstName, LastName, Username)
                    VALUES (?, ?, ?, ?)`,
                    [
                        userId,
                        firstName,
                        lastName,
                        username
                    ],
                    (insertErr, insertResult) => {

                        if (insertErr) {

                            //console.error('INSERT ERROR:', insertErr);

                            return bot.sendMessage(
                                chatId,
                                '❌ Failed to create account.'
                            );
                        }

                        //console.log('✅ INSERT SUCCESS:', insertResult);

                        bot.sendMessage(
                            chatId,
                            `Welcome ${firstName}! 👋`
                        );
                    }
                );

            } else {

                console.log('✅ User already exists');

                bot.sendMessage(
                    chatId,
                    ` Welcome back ${firstName}! 👋`
                );
            }
        }
    );
});


// ─────────────────────────────────────────────
// Message translator
// ─────────────────────────────────────────────

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
