#!/bin/sh

if [[ $# -ne 1 ]]; then
    echo "1 argument required: Cluster Name"
    exit 1
fi

gcloud dataproc clusters create $1 \
    --subnet default --zone us-central1-a \
    --master-machine-type n1-standard-4 --master-boot-disk-size 50 \
    --initialization-actions gs://dataproc-initialization-actions/hbase/hbase.sh \
    --num-workers 2 --worker-machine-type n1-standard-2 --worker-boot-disk-size 50 \
    --image-version 1.3-deb9 --project big-data-project-233100