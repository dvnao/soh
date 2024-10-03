# soh

## overview

this project provides a socket.io traffic monitoring tool specifically designed for brawlheroes (anime battle).

## features

- real-time monitoring of socket.io traffic
- logging of incoming and outgoing packets
- ability to replay outgoing packets
- event blocking functionality
- support for multiple socket types (main and chat)

## installation

### userscript

1. install a userscript manager like tampermonkey in your browser.
2. create a new script and paste the provided code.
3. save the script and ensure it's enabled.

### manual installation

alternatively, you can paste the script directly into the browser console after the game loads.

## usage

### accessing the game

1. visit the pc version of the game: [wayline game center](https://wayline.game/gameCenter/enjoy?token=zzk4puUOWCH13TXOOb6AuArwvucM++SDGAyizTWWsFypC0Woig2kXz9HVH1zig8eAulLuWVOud86+EudHyYqXwiW41BmJZCKWCF4WRguIzs=)
2. use browser developer tools to inspect the page and copy the `slogin` url.
3. paste the `slogin` url into your browser and enter.

### using the monitor

once the code is ran, the monitor will automatically hook into the game's socket.io connections. you can interact with the monitor through the global `soh` object in the browser console.

example commands:

```javascript
// log all packets for a specific event
soh.packetLog.get('eventName')

// replay a specific packet
soh.replayPacket('eventName', packetIndex)

// block an event from being logged
soh.blockEvent('eventName')

// unblock a previously blocked event
soh.unblockEvent('eventName')
```

## development

this project is open for contributions. if you'd like to extend its functionality or fix issues, please feel free to submit pull requests.

## disclaimer

this tool is for educational and debugging purposes only. use responsibly and respect the game's terms of service.


---

for any questions or issues, please open an issue in the project repository.
