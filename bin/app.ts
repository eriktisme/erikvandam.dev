#!/usr/bin/env node
import 'source-map-support/register'
import { App } from 'aws-cdk-lib'
import { WebsiteStack } from '../lib'

const app = new App()

new WebsiteStack(app, 'website', {
  domain: 'erikvandam.dev',
  env: {
    region: 'us-east-1',
  },
  tags: {
    project: 'website',
    ownedBy: 'Erik van Dam',
  },
})
