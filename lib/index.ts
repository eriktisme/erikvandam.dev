import { Stack, StackProps } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { Network } from './network'
import { Distribution } from './distribution'
import { Source } from './source'

interface WebsiteStackProps extends StackProps {
  domain: string
}

export class WebsiteStack extends Stack {
  constructor(scope: Construct, id: string, props: WebsiteStackProps) {
    super(scope, id, props)

    const network = new Network(this, 'network', props)

    const source = new Source(this, 'source', props)

    new Distribution(this, 'distribution', {
      ...props,
      hostedZone: network.hostedZone,
      certificate: network.certificate,
      sourceBucket: source.sourceBucket,
    })
  }
}
