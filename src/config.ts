import { ConfigService } from './services/config.service';

require('dotenv').config();

export const configService = new ConfigService();
