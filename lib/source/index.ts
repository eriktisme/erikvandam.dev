import { Construct } from 'constructs'
import {
  Bucket,
  BucketAccessControl,
  BucketEncryption,
} from 'aws-cdk-lib/aws-s3'
import { RemovalPolicy } from 'aws-cdk-lib'

interface SourceProps {
  domain: string
}

export class Source extends Construct {
  sourceBucket: Bucket

  constructor(scope: Construct, id: string, props: SourceProps) {
    super(scope, id)

    this.sourceBucket = new Bucket(this, 'source-bucket', {
      bucketName: props.domain,
      encryption: BucketEncryption.S3_MANAGED,
      removalPolicy: RemovalPolicy.DESTROY,
      accessControl: BucketAccessControl.PRIVATE,
      autoDeleteObjects: true,
    })
  }
}
