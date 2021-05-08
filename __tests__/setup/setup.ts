/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import * as path from 'path';
import * as fs from 'fs';
import {getClient} from '../../config/client';
import {collectCommands} from '../../config/commands';
import {destroyConnection} from '../../config/db';

const client = getClient();

export const jestSetup = (done): void => {
  const appDir = path.dirname(fs.realpathSync('app.js'));
  const commandsDir = `${appDir}/commands`;

  collectCommands(client, commandsDir);
  done();
};

export const jestTeardown = async (done): Promise<void> => {
  try {
    client.destroy();
    await destroyConnection();
    done();
  } catch (error) {
    console.log(error);
    done();
  }
};
