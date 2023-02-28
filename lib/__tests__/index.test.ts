import { App } from 'aws-cdk-lib'
import { WebsiteStack } from '../index'
import { Template } from 'aws-cdk-lib/assertions'

const stack = new WebsiteStack(new App(), 'stack', {
  domain: 'erikvandam.dev',
})

const template = Template.fromStack(stack)

describe('WebsiteStack', () => {
  it('should configure hosted zone', () => {
    template.hasResourceProperties('AWS::Route53::HostedZone', {
      Name: 'erikvandam.dev.',
    })

    template.hasResourceProperties('AWS::Route53::RecordSet', {
      Type: 'A',
      HostedZoneId: { Ref: 'networkhostedzoneC9E85F68' },
      Name: 'erikvandam.dev.',
    })

    template.hasResourceProperties('AWS::Route53::RecordSet', {
      Type: 'AAAA',
      HostedZoneId: { Ref: 'networkhostedzoneC9E85F68' },
      Name: 'erikvandam.dev.',
    })
  })

  it('should configure certificate', () => {
    template.hasResourceProperties('AWS::CertificateManager::Certificate', {
      DomainName: 'erikvandam.dev',
    })
  })

  it('should configure redirect', () => {
    template.hasResourceProperties('AWS::S3::Bucket', {
      WebsiteConfiguration: {
        RedirectAllRequestsTo: {
          HostName: 'erikvandam.dev',
          Protocol: 'https',
        },
      },
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: true,
        BlockPublicPolicy: true,
        IgnorePublicAcls: true,
        RestrictPublicBuckets: true,
      },
    })
  })

  it('should configure bucket', () => {
    template.hasResourceProperties('AWS::S3::Bucket', {
      BucketName: 'erikvandam.dev',
      WebsiteConfiguration: { IndexDocument: 'index.html' },
    })
  })

  it('should configure distribution', () => {
    template.hasResourceProperties('AWS::CloudFront::Distribution', {
      DistributionConfig: {
        Aliases: ['erikvandam.dev'],
        Enabled: true,
        HttpVersion: 'http2and3',
        IPV6Enabled: true,
        ViewerCertificate: {
          AcmCertificateArn: { Ref: 'networkcertificate64441299' },
          MinimumProtocolVersion: 'TLSv1.2_2021',
          SslSupportMethod: 'sni-only',
        },
      },
    })
  })

  it('should configure bucket deployment', () => {
    template.hasResourceProperties('Custom::CDKBucketDeployment', {
      DestinationBucketKeyPrefix: '/',
      DestinationBucketName: { Ref: 'sourcesourcebucket3985F4D1' },
      DistributionId: { Ref: 'distributioncloudfrontdistributionA23D2B2A' },
      Prune: true,
      RetainOnDelete: false,
    })
  })
})
