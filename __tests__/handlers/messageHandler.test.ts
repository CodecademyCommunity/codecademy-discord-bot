import * as filter from '../../commands/moderation/filter';
import rewire = require('rewire');
import {ClientUser, Message} from 'discord.js';
import {getClient} from '../../config/client';
import {jestSetup, jestTeardown} from '../setup/setup';
import MockDiscord from '../../__mocks__/mockDiscord';

const handlers = rewire('../../handlers/messageHandlers.js');
jest.mock('../../commands/moderation/filter');

const client = getClient();
let discord: MockDiscord;

beforeAll(jestSetup);
beforeEach(() => {
  jest.clearAllMocks();
  discord = new MockDiscord();
});
afterAll(jestTeardown);

describe('Message Handler', () => {
  handlers.__set__('commandParser', jest.fn());
  const commandParserSpy = handlers.__get__('commandParser');

  it('calls commandParser when prefix is correct', async () => {
    const message = discord.getMessage();
    message.content = 'cc!help';

    await handlers.messageHandler(message, client);
    expect(commandParserSpy).toHaveBeenCalledTimes(1);
  });

  it('does not call commandParser if prefix is not correct', async () => {
    const message = discord.getMessage();
    message.content = '!help';

    await handlers.messageHandler(message, client);
    expect(commandParserSpy).not.toHaveBeenCalled();
  });

  it('does not filter messages sent by itself', async () => {
    const mockClientUser = discord.getUser() as ClientUser;
    client.user = mockClientUser;

    const message = discord.getMessage();
    message.content = 'Hello There';

    await handlers.messageHandler(message, client);
    expect(filter.execute).not.toHaveBeenCalled();
  });

  it('does not filter messages sent in DM (where message.guild.id is null)', async () => {
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

    await handlers.messageHandler(message, client);
    expect(filter.execute).not.toHaveBeenCalled();
  });

  it('should filter messages not sent by the bot', async () => {
    const message = discord.getMessage();
    message.content = 'Hello There';

    await handlers.messageHandler(message, client);

    expect(filter.execute).toHaveBeenCalledTimes(1);
    expect(filter.execute).toHaveBeenCalledWith(message);
  });
});
