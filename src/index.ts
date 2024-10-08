import app from './app';
import { configService } from './config';

const port = configService.getAppPort();
app.listen(port, () => {
  /* eslint-disable no-console */
  console.log(`Listening: http://localhost:${port}`);
  /* eslint-enable no-console */
});
