const fs = require('fs')

function printUsage() {
  console.log('\tmix-edit.js: a JSON-based mixtape editor!')
  console.log('\tUsage:  node mix-edit <mixFile> <changeFile> <outputFile>') 
  console.log('\tSee README for <changeFile> formatting details.')
}

function validateSongs(songs, mixtape) {
  for (let song of songs) {
    if(mixtape.songs.find(s => s.id == song) == undefined) {
      console.log(`Cannot add invalid song ID: ${song}`)
      process.exit(1)
    }
  }
}

if (process.argv.length != 5) {
  printUsage()
  process.exit(0)
}

let args = process.argv.slice(2)

let mixtape = {}
try {
  mixtape = JSON.parse(fs.readFileSync(args[0]))
} catch (error) {
  console.log(`[ERROR]: Failed to read mixFile: ${error}`)
  process.exit(1)
}

let changes = {}
try {
  changes = JSON.parse(fs.readFileSync(args[1]))
} catch(error) {
  console.log(`[ERROR]: Failed to read changeFile: ${error}`)
  process.exit(1)
}

// Avoid indexing pitfalls
// A UUID might be a better approach here scalability-wise 
mixtape.playlists.sort((a, b) => {
  Number(a.id) === Number(b.id) ? 0 : 
    Number(a.id) < Number(b.id) ? -1 : 1
})

for (let change of changes) {
  switch (change.op) {
    case("add-song"):
      if (mixtape.playlists.find(playlist => playlist.id == change.playlist_id) == undefined) {
        console.log(`[ERROR]: Cannot add song to invalid (or deleted) playlist ID: ${change.playlist_id}`)
        process.exit(1)
      } 
      validateSongs([change.song_id], mixtape)
      mixtape.playlists.find(playlist => playlist.id == change.playlist_id)
        .song_ids
        .push(change.song_id)
      break
    case("add-playlist"):
      if (mixtape.users.find(user => user.id == change.user_id) == undefined) {
        console.log(`[ERROR]: Cannot add playlist to invalid user ID: ${change.user_id}`)
        process.exit(1)
      }
      validateSongs(change.song_ids, mixtape)

      // Loses ability to correctly compute indices past Number.MAX_SAFE_VALUE
      // (9,007,199,254,740,991) which is clearly not enough Taylor Swift.
      mixtape.playlists.push({
        "id": `${Number(mixtape.playlists[mixtape.playlists.length-1].id) + 1}`,
        "user_id": change.user_id,
        "song_ids": change.song_ids
      })
      break
    case("delete-playlist"):
      mixtape.playlists.splice(
        mixtape.playlists.findIndex(playlist => playlist.id == change.playlist_id),
        1
      )
      break
    default:
      console.log(`[ERROR]: Invalid change operation: ${change}`)
      process.exit(1)
  }
}

fs.writeFileSync(defaultOutFile, JSON.stringify(mixtape, null, 2))
console.log('Changes applied successfully!')