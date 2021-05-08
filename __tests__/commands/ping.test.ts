import {getConnection} from '../../config/db';
import MockDiscord from '../../__mocks__/mockDiscord';
import {execute} from '../../commands/utility/ping';
import {jestSetup, jestTeardown} from '../setup/setup';

beforeAll(jestSetup);
beforeEach(() => {
  jest.clearAllMocks();
});
afterAll(jestTeardown);

describe('Ping Command', () => {
  const con = getConnection();
  const discord = new MockDiscord();

  it('should send Pong.', async () => {
    const message = discord.getMessage();
    message.content = 'cc!ping';
    await execute(message, [], con);
    expect(message.channel.send).toHaveBeenCalledTimes(1);
    expect(message.channel.send).toHaveBeenCalledWith('Pong.');
  });
});
