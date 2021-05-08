import * as filter from '../../commands/moderation/filter';
import {ClientUser, Message} from 'discord.js';
import {getClient} from '../../config/client';
import {getConnection} from '../../config/db';
import {jestSetup, jestTeardown} from '../setup/setup';
import MockDiscord from '../../__mocks__/mockDiscord';

import * as handlers from '../../handlers/msgH'; // Switch this back to the real code later

jest.mock('../../commands/moderation/filter');

// TODO: Give client a default user
const client = getClient();
let discord: MockDiscord;

beforeAll(jestSetup);
beforeEach(() => {
  jest.clearAllMocks();
  discord = new MockDiscord();
});
afterAll(jestTeardown);

describe('Message Handler', () => {
  const con = getConnection();

  it('calls commandParser when prefix is correct', async () => {
    const message = discord.getMessage();
    message.content = 'cc!help';

    const commandParserSpy = jest.spyOn(handlers, 'commandParser');

    await handlers.messageHandler(message);
    expect(commandParserSpy).toHaveBeenCalledTimes(1);
    expect(commandParserSpy).toHaveBeenCalledWith(client, con, message);
  });

  it('does not call commandParser if prefix is not correct', async () => {
    const mockClientUser = ({
      id: '987654321', // Client user is not the bot
    } as unknown) as ClientUser;
    client.user = mockClientUser;

    const message = discord.getMessage();
    message.content = '!help';

    const commandParserSpy = jest.spyOn(handlers, 'commandParser');

    await handlers.messageHandler(message);
    expect(commandParserSpy).not.toHaveBeenCalled();
  });

  it('does not filter messages sent by itself', async () => {
    const mockClientUser = discord.getUser() as ClientUser;
    client.user = mockClientUser;

    const message = discord.getMessage();
    message.content = 'Hello There';

    await handlers.messageHandler(message);
    expect(filter.execute).not.toHaveBeenCalled();
  });

  it('does not filter messages sent in DM (where message.guild.id is null)', async () => {
    const mockClientUser = ({
      id: '987654321', // Client user is not the bot
    } as unknown) as ClientUser;
    client.user = mockClientUser;

    const message = ({
      channel: {
        send: jest.fn(),
      },
      content: '',
      author: {
        id: 'mock-id',
        bot: false,
      },
      member: {},
      guild: null, // Message is in DM
    } as unknown) as Message;

    message.content = 'Hello There';

    await handlers.messageHandler(message);
    expect(filter.execute).not.toHaveBeenCalled();
  });

  it('should filter messages not sent by the bot', async () => {
    const mockClientUser = ({
      id: '987654321', // Client user is not the bot
    } as unknown) as ClientUser;
    client.user = mockClientUser;

    const message = discord.getMessage();
    message.content = 'Hello There';

    await handlers.messageHandler(message);

    expect(filter.execute).toHaveBeenCalledTimes(1);
    expect(filter.execute).toHaveBeenCalledWith(message);
  });
});
