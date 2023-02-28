import { Construct } from 'constructs'
import {
  AaaaRecord,
  ARecord,
  PublicHostedZone,
  RecordTarget,
} from 'aws-cdk-lib/aws-route53'
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager'
import { Bucket } from 'aws-cdk-lib/aws-s3'
import {
  AllowedMethods,
  CacheCookieBehavior,
  CachedMethods,
  CachePolicy,
  CacheQueryStringBehavior,
  Distribution as CloudFrontDistribution,
  HttpVersion,
  OriginAccessIdentity,
  PriceClass,
  SecurityPolicyProtocol,
  ViewerProtocolPolicy,
} from 'aws-cdk-lib/aws-cloudfront'
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins'
import { Duration } from 'aws-cdk-lib'
import {
  BucketDeployment,
  ServerSideEncryption,
  Source,
} from 'aws-cdk-lib/aws-s3-deployment'
import { CloudFrontTarget } from 'aws-cdk-lib/aws-route53-targets'
import { CanonicalUserPrincipal, PolicyStatement } from 'aws-cdk-lib/aws-iam'

interface DistributionProps {
  domain: string
  hostedZone: PublicHostedZone
  certificate: Certificate
  sourceBucket: Bucket
}

export class Distribution extends Construct {
  constructor(scope: Construct, id: string, props: DistributionProps) {
    super(scope, id)

    const originAccessIdentity = new OriginAccessIdentity(
      this,
      'cloudfront-origin-access-identity',
      {
        comment: 'Setup access from CloudFront to the source bucket (read).',
      }
    )

    props.sourceBucket.grantRead(originAccessIdentity)

    const distribution = new CloudFrontDistribution(
      this,
      'cloudfront-distribution',
      {
        domainNames: [props.domain],
        certificate: props.certificate,
        enabled: true,
        enableIpv6: true,
        httpVersion: HttpVersion.HTTP2_AND_3,
        minimumProtocolVersion: SecurityPolicyProtocol.TLS_V1_2_2021,
        priceClass: PriceClass.PRICE_CLASS_100,
        defaultRootObject: 'index.html',
        defaultBehavior: {
          origin: new S3Origin(props.sourceBucket, {
            originAccessIdentity,
          }),
          viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          allowedMethods: AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
          cachedMethods: CachedMethods.CACHE_GET_HEAD,
          cachePolicy: new CachePolicy(this, 'default-cache-policy', {
            minTtl: Duration.seconds(0),
            defaultTtl: Duration.seconds(3600),
            maxTtl: Duration.seconds(86400),
            cookieBehavior: CacheCookieBehavior.none(),
            queryStringBehavior: CacheQueryStringBehavior.none(),
            enableAcceptEncodingGzip: true,
            enableAcceptEncodingBrotli: true,
          }),
          compress: true,
        },
      }
    )

    new ARecord(this, 'a-record', {
      zone: props.hostedZone,
      target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
      recordName: props.domain,
    })

    new AaaaRecord(this, 'aaaa-record', {
      zone: props.hostedZone,
      target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
      recordName: props.domain,
    })

    new BucketDeployment(this, 'source-deployment', {
      sources: [Source.asset('./dist')],
      destinationBucket: props.sourceBucket,
      serverSideEncryption: ServerSideEncryption.AES_256,
      distribution,
      distributionPaths: ['/*'],
      prune: true,
      retainOnDelete: false,
    })
  }
}
