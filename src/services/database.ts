import { Driver, getCredentialsFromEnv, IDriverSettings } from 'ydb-sdk'

const getDatabase = (config: Config) => {
  const authService = getCredentialsFromEnv()
  const driver = new Driver({ ...config, authService })
  return driver
}

type Config = Pick<IDriverSettings, 'endpoint' | 'database'>

const config: Config = {
  endpoint: process.env.DATABASE_ENDPOINT!,
  database: process.env.DATABASE_NAME!
}

export default getDatabase(config)
