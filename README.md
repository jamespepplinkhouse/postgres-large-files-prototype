# postgres-large-files-prototype

## Why?

This code will test various scenarios of uploading and downloading files from Postgres Large File Storage. In production we have seen that poor network conditions can interrupt an upload or download leaving transactions open which eventually will queue and lock any further transactions.

We want battle hardened Node.js code that will clean up transactions so that the server can survive these conditions!

## Useful SQL Queries for Postgres

### Find open transaction locks
```sql
SELECT * FROM pg_locks pl
LEFT JOIN pg_stat_activity psa
ON pl.pid = psa.pid
WHERE application_name != 'pgAdmin III - Query Tool';
```

### Kill a transaction
```sql
select pg_terminate_backend(18234);
```

### Download a file
```bash
$ psql --host localhost -U postgres -d media -p 5444 -c "\lo_export 17531 '~/Desktop/download.test' "
```

### List large objects
```bash
$ psql --host localhost -U postgres -d media -p 5444 -c "\lo_list"
```

## Express Streamer

- Serves a single index.html on localhost:8080
- That index file includes 2 html5 video elements
- One is hitting an endpoint able to stream a media with range header
- The other one is hitting an endpoint that serves complete files 

### Get Started

- Get a sample video from: http://www.sample-videos.com/ : http://www.sample-videos.com/video/mp4/720/big_buck_bunny_720p_30mb.mp4
- Create `testVideo.mp4` in `/data`
- Restart the pg media container : `npm run down && npm run up`
- Upload the test video in the media db : `npm run express:setup`
- `npm run express:start`
- Connect to `http://localhost:8080`
