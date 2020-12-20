import express from 'express';
import cors from 'cors';
import * as socketIo from 'socket.io';
import { createServer } from 'http';

import { v4 } from 'uuid';

import IPlayerDTO from './dtos/IPlayerDTO';

const app = express();

app.use(cors());
app.options('*', cors);

const server = createServer(app);

const io = socketIo.listen(server);

server.listen(3333, () => {
  console.log('server started at port 3333');
});

let playersOnline: IPlayerDTO[] = [];

io.on('connect', socket => {
  const playerId = v4();

  socket.on('start', (player: Omit<IPlayerDTO, 'id'>, callback) => {
    const newPlayer = Object.assign(player, { id: playerId });

    playersOnline.push(newPlayer);

    io.emit('update', playersOnline);
    socket.send({ player: newPlayer });
    callback(newPlayer);

    console.log(`player ${playerId} connected`);
  });

  socket.on('disconnect', () => {
    console.log(`player ${playerId} disconnected`);

    const result = playersOnline.filter(item => item.id !== playerId);
    playersOnline = result;

    io.emit('update', result);
  });

  socket.on('update', (updatedPlayer: IPlayerDTO) => {
    console.log(updatedPlayer);

    const result = playersOnline.map(item => {
      if (item.id === updatedPlayer.id) {
        return updatedPlayer;
      }

      return item;
    });
    playersOnline = result;

    io.emit('update', playersOnline);
  });
});
