import cheerio from "cheerio";
import fs from "fs";

const BASE_URI = 'https://ais.usvisa-info.com/en-tr/niv'

export function handleErrors(response) {
    const errorMessage = response['error']
  
    if (errorMessage) {
      throw new Error(errorMessage);
    }
  
    return response
}
  
export async function extractHeaders(res) {
    const cookies = extractRelevantCookies(res)
  
    const html = await res.text()
    const $ = cheerio.load(html);
    const csrfToken = $('meta[name="csrf-token"]').attr('content')
  
    return {
      "Cookie": cookies,
      "X-CSRF-Token": csrfToken,
      "Referer": BASE_URI,
      "Referrer-Policy": "strict-origin-when-cross-origin",
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
      'Cache-Control': 'no-store',
      'Connection': 'keep-alive'
    }
}
  
export function extractRelevantCookies(res) {
    const parsedCookies = parseCookies(res.headers.get('Set-Cookie'))
    return `_yatri_session=${parsedCookies['_yatri_session']}`
}
  
function parseCookies(cookies) {
    const parsedCookies = {}
  
    cookies.split(';').map(c => c.trim()).forEach(c => {
      const [name, value] = c.split('=', 2)
      parsedCookies[name] = value
    })
  
    return parsedCookies
}
  
export function sleep(s) {
    s = 300 + Math.floor(Math.random() * 100)
    console.log(`Sleeping ${s} seconds...`)
    s = s * 1000
    return new Promise((resolve) => {
      setTimeout(resolve, s );
    });
}
  
export function log(message, flush=false) {
    console.log(`[${new Date().toISOString()}]`, message)

    if(flush)
      fs.appendFileSync('events.txt', `[${new Date().toISOString()}] ${message}\n`)
}
