// import {getConnection} from '../../config/db';
import MockDiscord from '../../__mocks__/mockDiscord';
import {jestSetup, jestTeardown} from '../setup/setup';
import * as handlers from '../../handlers/messageHandlers';

const discord = new MockDiscord();

beforeAll(jestSetup);
beforeEach(() => {
  jest.clearAllMocks();
});
afterAll(jestTeardown);

describe('Ping command (integration test)', () => {
  it('should send Pong.', async () => {
    const message = discord.getMessage();
    message.content = 'cc!ping';
    await handlers.messageHandler(message);
    expect(message.channel.send).toHaveBeenCalledWith('Pong.');
  });
});
