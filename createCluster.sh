#!/bin/sh

if [[ $# -ne 1 ]]; then
    echo "1 argument required: Cluster Name"
    exit 1
fi

gcloud dataproc clusters create $1 \
    --region us-west1 \
    --subnet default --zone "" \
    --master-machine-type n1-standard-2 --master-boot-disk-type pd-ssd --master-boot-disk-size 100 \
    --initialization-actions gs://dataproc-initialization-actions/zookeeper/zookeeper.sh,gs://dataproc-initialization-actions/hbase/hbase.sh,gs://dataproc-initialization-actions/kafka/kafka.sh \
    --metadata "run-on-master=true" \
    --num-workers 2 --worker-machine-type n1-standard-2 --worker-boot-disk-size 100 \
    --image-version 1.3-deb9 --project big-data-project-233100
