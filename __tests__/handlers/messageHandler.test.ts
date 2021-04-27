import { Client, Message } from 'discord.js';
import * as path from 'path';
import * as fs from 'fs';
import { messageHandler } from '../../handlers/messageHandler.js';
import { getClient } from '../../config/client';
import { getConnection, destroyConnection } from '../../config/connection';
import { collectCommands } from '../../config/commands';


describe("Message Handler", () => {
  const message = ({
    channel: {
      send: jest.fn(),
    },
    content: "",
    author: {
      bot: false,
    },
    member: {},
  } as unknown) as Message;

  beforeAll((done) => {
    const client = getClient();
    const appDir = path.dirname(fs.realpathSync('app.js'));
    const commandsDir = `${appDir}/commands`;

    collectCommands(client, commandsDir);
    done();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async (done) => {
    const client = getClient();
    try {
      client.destroy();
      await destroyConnection()
      done();
    } catch (error) {
      console.log(error);
      done();
    }
  })

  it('should send Pong.', async () => {
    message.content = 'cc!ping';
    await messageHandler(message);
    expect(message.channel.send).toHaveBeenCalledWith('Pong.');
  });
});