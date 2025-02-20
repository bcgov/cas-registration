#### k6 Load testing

**IMPORTANT**: Before running load tests notify platform services. It's okay to test that any script modifications are working with a small amount of virtual users though we should notify them when we are running heavy tests.

###### Steps to run loads tests

1. Install k6 - https://k6.io/docs/get-started/installation/

2. Make `k6_results` folder in project root

3. Choose which test you are going to run in `/app/tests/perf/[backend/frontend]-load-test.js`.

4. Test it is working correctly by running tests against your local backend server running at `http://127.0.0.1:8000/`.

```
**IMPORTANT**: If running the frontend tests you will need to disable auth and deploy an image to OpenShift. We implemented a hacky solution and didn't want to merge it into the codebase here that can be used as an example: https://github.com/bcgov/cas-registration/pull/898
```

5. Change variable `APP_HOST` pr `SERVER_HOST` value in Makefile to the route being tested eg: `https://cas-reg-backend-dev.apps.silver.devops.gov.bc.ca/home/`

6. Run `make perf_test_[app]_backend` or `make perf_test_[app]_frontend` to run the tests

7. Monitor deployment

8. Results will be in `k6_results` folder in .csv format
