#### k6 Load Testing

**IMPORTANT**: Before running load tests, notify platform services. It's okay to test that any script modifications are working with a small number of virtual users, but we should notify them when we are running heavy tests.

###### Steps to Run Load Tests

1. **Install k6** - Follow the instructions at [k6 Installation Guide](https://k6.io/docs/get-started/installation/). If you already have k6 installed, make sure you have the latest version.

2. **Create Results Folder** - Make a `k6_results` folder in the project root.

3. **Choose Test** - Select the test you are going to run in `/app/tests/perf/[backend/frontend]-load-test.js`.

4. **Local Testing** - Test that it is working correctly by running tests against your local backend server running at `http://127.0.0.1:8000/`.

   **IMPORTANT**: If running the frontend tests, you will need to disable auth and deploy an image to OpenShift. We implemented a hacky solution and didn't want to merge it into the codebase. You can use this example: [Example Pull Request](https://github.com/bcgov/cas-registration/pull/2924).

5. **Update Makefile** - Change the variable `APP_HOST` or `SERVER_HOST` value in the Makefile to the route being tested, e.g., `https://cas-reg-backend-dev.apps.silver.devops.gov.bc.ca/home/`.

6. **Run Tests** - Execute `make perf_test_[app]_backend` or `make perf_test_[app]_frontend` to run the tests.

7. **Monitor Deployment** - Keep an eye on the deployment process.

8. **Check Results** - Results will be in the `k6_results` folder in .csv format.

9. **Monitor Results** - We have added [`K6_WEB_DASHBOARD=true`](https://grafana.com/docs/k6/latest/results-output/web-dashboard/) to the make target by default, and it will show `web dashboard: http://127.0.0.1:5665` in the terminal. You can view the results in the browser (with a 10s refresh rate).
