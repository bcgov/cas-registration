# [1.16.0](https://github.com/bcgov/cas-registration/compare/v1.15.0...v1.16.0) (2024-12-12)

### Bug Fixes

- additional data nav buttons ([2676232](https://github.com/bcgov/cas-registration/commit/267623284e235fb01d7f79ae8234363d7aacaa11))
- crash on removing all items from a multiselect widget ([cd7004b](https://github.com/bcgov/cas-registration/commit/cd7004b802f6b052bef7d7fa59a5954d32447e76))
- Fix reporting step buttons on attachments and allocation pages ([d1097af](https://github.com/bcgov/cas-registration/commit/d1097af4de1516f7705810a33b2cbdf7a33c918b))
- formState is not persisted across activity pages ([d096887](https://github.com/bcgov/cas-registration/commit/d096887a021b4ae429da0a92eb280469feb8c7cd))
- minimum item count in products and activities for an operation ([0839662](https://github.com/bcgov/cas-registration/commit/08396624bbf4a85e1f535d90dcbaa53e6b71994b))
- submit blocked when validation failed once ([5dbb0df](https://github.com/bcgov/cas-registration/commit/5dbb0dfb5e6f5ab76e1f4a19b3f368a5db860d82))

### Features

- Add alumina production JSON Schemas and UISchemas + rebase/style/field type edits ([1e22802](https://github.com/bcgov/cas-registration/commit/1e22802c335feb738f1726895839800d92f1db9b))
- Add reporting step buttons component for reporting forms, separating save and continue buttons ([da2b6ac](https://github.com/bcgov/cas-registration/commit/da2b6acdd617872378c925d613a5497d204a7cff))
- allocation of emissions ([38aad11](https://github.com/bcgov/cas-registration/commit/38aad11f8b682992081f2d09a072c3669a1b9b5a))
- new page for final report review ([abf15f0](https://github.com/bcgov/cas-registration/commit/abf15f08ded8590c9d84bfefd535122a29b385d9))

### Reverts

- Revert "test: v2 endpoint tests" ([505897a](https://github.com/bcgov/cas-registration/commit/505897af1a090d7a8115d445af738a31c0a3052d))

# [1.15.0](https://github.com/bcgov/cas-registration/compare/v1.14.0...v1.15.0) (2024-11-27)

### Features

- add snackbar to external user access grid ([d2cab09](https://github.com/bcgov/cas-registration/commit/d2cab092db3aee6bac98648f62118421a7a32fa7))
- attachments page with upload fields ([0cd5c45](https://github.com/bcgov/cas-registration/commit/0cd5c45261c46ad84571b16f1ffa778b33504b3c))
- internal users can view access requests ([7e3514d](https://github.com/bcgov/cas-registration/commit/7e3514dbcea2a9148f820205743d4899b35e8084))
- report verification ([b7314f3](https://github.com/bcgov/cas-registration/commit/b7314f3fca45700a46ed952650937e913383164d))
- units displayed on production-data form ([c8364bb](https://github.com/bcgov/cas-registration/commit/c8364bbcaf1b950da365969d97b1fb1042ea2e34))

# [1.14.0](https://github.com/bcgov/cas-registration/compare/v1.13.0...v1.14.0) (2024-11-15)

### Features

- add facility emission summary page ([11c314c](https://github.com/bcgov/cas-registration/commit/11c314c620bcbc8c4b8d02180451ba50dae519c9))
- add schemaspy.yaml to provide database schema documentation on main merge. ([570a811](https://github.com/bcgov/cas-registration/commit/570a811de4d65a1e588544e3aed4f6c3ce748082))
- add widget to remove operation rep to reg form ([8cadd8d](https://github.com/bcgov/cas-registration/commit/8cadd8d7cc62b030555c45290e96b221f8e8c4aa))
- internal users can view facility information ([99e64fa](https://github.com/bcgov/cas-registration/commit/99e64faf28b4749d6a5b3fbd4e0efe8cb95d6b61))
- serialize report activity into a dict ([1c95d64](https://github.com/bcgov/cas-registration/commit/1c95d64e2d9e69b73640724315e34134c6b49c8b))

# [1.13.0](https://github.com/bcgov/cas-registration/compare/v1.12.0...v1.13.0) (2024-11-06)

### Bug Fixes

- Add boolean option to allow deletion of first array field template item ([011f5bc](https://github.com/bcgov/cas-registration/commit/011f5bc7f05b616124a978beedf9d9031ecda59c))
- Add empty default so formdata on LFO array has initial section 2 validation ([ec45a45](https://github.com/bcgov/cas-registration/commit/ec45a45d5f78a39057c8d6070341d3f0d489aaa4))
- facility report cannot list products ([06b32b9](https://github.com/bcgov/cas-registration/commit/06b32b979cc68e347cb5a670c05a8a501e8d1be6))
- Set operation.opt_in to true when opted-in operation is selected ([354ef8e](https://github.com/bcgov/cas-registration/commit/354ef8e2e5d4c5d41f9857ef53569e20c7631535))

### Features

- [rebase] Integrate save_methodology func in save report activity file and add fk migration associated ([5756d2d](https://github.com/bcgov/cas-registration/commit/5756d2d8b310a835e9192fb42bed9a9646ca37dd))
- add operator details dashboard for internal users ([1190787](https://github.com/bcgov/cas-registration/commit/1190787e2edf640234bb655600a5d31e4a85c138))
- apply emission categories to emission records on save/update ([a6d92ce](https://github.com/bcgov/cas-registration/commit/a6d92ce124a866afd4ac02f4e34ef39831a461e6))
- Display opt-in information on operation details page if opted-in ([3456fc1](https://github.com/bcgov/cas-registration/commit/3456fc1ccad0f184e2555b5fe179f740466647ef))
- show BORO ID on operation form ([97aeac7](https://github.com/bcgov/cas-registration/commit/97aeac7493925155714cb5702d713a9667f28aee))

# [1.12.0](https://github.com/bcgov/cas-registration/compare/v1.11.0...v1.12.0) (2024-10-23)

### Bug Fixes

- activity form state should not persist when switching activities ([dfe9d21](https://github.com/bcgov/cas-registration/commit/dfe9d21038127c9c53210f6b5e52c56e84767585))
- fix operation registration back navigation ([711619e](https://github.com/bcgov/cas-registration/commit/711619ec5896e0ec07dc6ec5a3efcd24d5325f90))

### Features

- a service to save the activity report data ([853fc78](https://github.com/bcgov/cas-registration/commit/853fc788906ae5f2036b7bf740217a49c1d2c812))
- create internal operator detail page ([200073c](https://github.com/bcgov/cas-registration/commit/200073c4d062ed892da6a1d4a7ee96b67f600da6))
- external user can see operator's user access grid ([0f94f58](https://github.com/bcgov/cas-registration/commit/0f94f58ccfcb12c797fb49c7e9fb198e25ff0a42))
- generate acitivity task list ([5f5dad9](https://github.com/bcgov/cas-registration/commit/5f5dad9cee887079e94ac1a18cc74929114d3125))
- internal user can view an operation ([ef84308](https://github.com/bcgov/cas-registration/commit/ef84308b01a797adb0d5cb5716fcc0f6ca6c2761))
- registration info must be complete to change operation status ([1142789](https://github.com/bcgov/cas-registration/commit/1142789c0ce75b3eeacf864c074105468a64aac5))

# [1.11.0](https://github.com/bcgov/cas-registration/compare/v1.10.0...v1.11.0) (2024-10-08)

### Bug Fixes

- add build images to dashboard-e2e workflow needs ([b710e43](https://github.com/bcgov/cas-registration/commit/b710e43d5f1b87adb29d90217ef8c44c0789c155))
- facility information lfo form route change error ([bf3e440](https://github.com/bcgov/cas-registration/commit/bf3e440c7ef7c90cc8296f601abb80c49cf38133))
- multiselect minitems error ([e988c4c](https://github.com/bcgov/cas-registration/commit/e988c4cb5e3976478680f61ded721e4dfb681a6a))
- page is stuck on add mode after creating a contact ([0a2e828](https://github.com/bcgov/cas-registration/commit/0a2e82808aadddc23d2da89d7b0b160705e31546))
- playwright e2e html report uploads in ci ([10a58e7](https://github.com/bcgov/cas-registration/commit/10a58e73c0d9dd0d0019b68529ced9d358f69cec))
- Remove add facility button for SFO and include check on backed POST to ensure SFO has 1 facility ([c55fbbf](https://github.com/bcgov/cas-registration/commit/c55fbbfd12ba68cf8d12931678d113c076d1e4ef))

### Features

- add an operator ([d92c54b](https://github.com/bcgov/cas-registration/commit/d92c54b7279dfab17d927a3fe9888f9f6fa1d857))
- add frontend for pulp and paper activity ([1bde5d4](https://github.com/bcgov/cas-registration/commit/1bde5d4442e2c6334fe252404a3674b5083d9932))
- add places assigned to contact form ([ab12ccd](https://github.com/bcgov/cas-registration/commit/ab12ccd233fbd6b62f029879b69e9a01718082ca))
- Create inline array field template for well auth numbers ([3b62806](https://github.com/bcgov/cas-registration/commit/3b62806fd269906fe9a168163686c5fa135a0c1d))
- facility timeline shows in app grids ([1af7ab0](https://github.com/bcgov/cas-registration/commit/1af7ab046feb60af37bae5c90c934124cb29b6f1))
- GSC Non Compression Non Processing activity ([becd45e](https://github.com/bcgov/cas-registration/commit/becd45e4fc0fc2e3ae024fc42adfbc4884f54be6))
- reg workflow steps are conditional based on purpose ([d59514a](https://github.com/bcgov/cas-registration/commit/d59514ab7bdf0a12a967c4a855de8e2fbaa32277))
- retry owasp-zap on failure ([d21755b](https://github.com/bcgov/cas-registration/commit/d21755bb7821a2a9ea48ddaed5b918ccbb6c86e9))
- run all e2e tests on merge to develop/main ([d3daa6d](https://github.com/bcgov/cas-registration/commit/d3daa6d28c1f620230430bd48f9b85d90909efe1))
- Set up and display operators page, grid and data with routing for internal users ([12ff4c2](https://github.com/bcgov/cas-registration/commit/12ff4c23b2b859a312629585c1dd7a0012c2473a))
- step 1 of reg workflow ([3065d1a](https://github.com/bcgov/cas-registration/commit/3065d1ad9b9a931c03ae4091bbf1b27930d6959c))

### Reverts

- Revert "chore: attempt to remove dunders" ([8a09d6f](https://github.com/bcgov/cas-registration/commit/8a09d6fe9bd3cd02a3bd3acb55686ef8a73085a3))

# [1.10.0](https://github.com/bcgov/cas-registration/compare/v1.9.0...v1.10.0) (2024-09-04)

### Bug Fixes

- error when there are no table rows ([4a9daad](https://github.com/bcgov/cas-registration/commit/4a9daadc3be3cfef9aca33596bf879b63b5eaf48))

### Features

- add activity page for refinery fuel gas combustion ([ecca331](https://github.com/bcgov/cas-registration/commit/ecca331edaf5d89dae214c0a2a2ba6e6f28518ee))
- add frontend for carbonate use activity ([4b0e9ce](https://github.com/bcgov/cas-registration/commit/4b0e9ce574c6b4c21692df2ff61bfe0d3c82185d))
- add fuel combustion by mobile equipment activity page ([c9e081d](https://github.com/bcgov/cas-registration/commit/c9e081db418ab5b67392e2b49fe3bc546a1f74de))
- add operation registration submission step ([131688d](https://github.com/bcgov/cas-registration/commit/131688d9206fdf68da6bbbd6840bb252f1907ddd))
- add opted-in operation details ([bd154e6](https://github.com/bcgov/cas-registration/commit/bd154e6bceb2c1e45614450649d0cdc35fff26f6))
- add status and boro id columns to operation data grid ([c33ff53](https://github.com/bcgov/cas-registration/commit/c33ff531ac958fd5af95171594a3adde6c33b165))
- adding activity page ([01473f1](https://github.com/bcgov/cas-registration/commit/01473f1459e1ef4ddde35b7eb0b1bbd3cfa2b66d))
- create registration workflow step 1 form ([34c120d](https://github.com/bcgov/cas-registration/commit/34c120d30d516e9ca5f14d65462e64334f9cf7de))
- facility form edit ([b146059](https://github.com/bcgov/cas-registration/commit/b146059c53646871d4c571804f2e4203cb9ad121))
- select an operator ([62b74b8](https://github.com/bcgov/cas-registration/commit/62b74b83cf98d8c03bbb23d1070593cdbcf43c32))
- user can submit operation rep ([83bf007](https://github.com/bcgov/cas-registration/commit/83bf007754eab9e84112c3f408885381ecb22f97))

# [1.9.0](https://github.com/bcgov/cas-registration/compare/v1.8.0...v1.9.0) (2024-08-07)

### Features

- add due date to reporting dashboard ([ee5765a](https://github.com/bcgov/cas-registration/commit/ee5765ab6b6691ea568bea7bee8f3add8c3e8eba))

# [1.8.0](https://github.com/bcgov/cas-registration/compare/v1.7.0...v1.8.0) (2024-08-07)

### Bug Fixes

- don't truncate reporting year table on truncate_dev_data_tables call ([fc86ee3](https://github.com/bcgov/cas-registration/commit/fc86ee34ec04b9cb7a652617fed4a8804a66ce9c))

### Features

- [rebase] Add conditional starting_date field in db and Add Facility form ([81499d1](https://github.com/bcgov/cas-registration/commit/81499d1d2e8bd4152d24aaf814b53be837993dff))
- add ActivityForm component & gsc page ([0f6a60b](https://github.com/bcgov/cas-registration/commit/0f6a60b0088b332e6531eebb4fe51f40678bc204))

# [1.7.0](https://github.com/bcgov/cas-registration/compare/v1.6.0...v1.7.0) (2024-08-01)

### Bug Fixes

- build fails due to global vi ([34ae4bc](https://github.com/bcgov/cas-registration/commit/34ae4bcb070907efb27c2f97d034e2d6bd176eba))
- not showing facilities with end date ([5d80380](https://github.com/bcgov/cas-registration/commit/5d80380ff905958fd9a923fc8f58fc24a7d571f3))
- registration1 upload limit bug ([e09d658](https://github.com/bcgov/cas-registration/commit/e09d6586414428d98c737ac96c2aca92af499410))
- remove failing job ([66843fa](https://github.com/bcgov/cas-registration/commit/66843fa8a9cbe986764fb58acaad0417fa844bf6))
- replace hard-coded value in job with variable ([7d9948a](https://github.com/bcgov/cas-registration/commit/7d9948a44ce66e23ab94b8899e01455707a95651))
- use correct value in route ([e3c33d7](https://github.com/bcgov/cas-registration/commit/e3c33d792b67acee44009f41cf7edffcec2d0e49))

### Features

- [rebase 2] Configure COAM app for auth sharing + fix css and package json for coam ([f847da8](https://github.com/bcgov/cas-registration/commit/f847da8183d178b1518612957439a76a50caa5bf))
- add Actions column to Reporting Operations dashboard ([f363b00](https://github.com/bcgov/cas-registration/commit/f363b008d22e9a61ab82dd52e1eb22ec8af12402))
- add contact form ([94234bc](https://github.com/bcgov/cas-registration/commit/94234bcf713a46eb63f0eb8ba857b973fdb8eef9))
- add contact list endpoint and schema ([fc94d36](https://github.com/bcgov/cas-registration/commit/fc94d363f19f18b54e9a80ca63868b9c323af595))
- add current reporting year to operations page ([940bf10](https://github.com/bcgov/cas-registration/commit/940bf10788ff9d7602c54d6c66306d36cd3e42c4))
- add custom migrate command ([ba74a3c](https://github.com/bcgov/cas-registration/commit/ba74a3c4c7f6a92520d7ed1f344a6beb860b03a0))
- add date widget ([d9446fc](https://github.com/bcgov/cas-registration/commit/d9446fce91c6d34c399812800c176a22cc4f1d33))
- add facility form ([3e25578](https://github.com/bcgov/cas-registration/commit/3e255781d4414409624d9e5097ef27512bdc88da))
- add facility list endpoint and schema ([c35ef3c](https://github.com/bcgov/cas-registration/commit/c35ef3cfc6cb7ade552713b190234e7e21c6e224))
- add form builder API endpoint & service ([67764f8](https://github.com/bcgov/cas-registration/commit/67764f839cb94d3b77e8128459501d4037bf9af8))
- add helm chart for new bciers applications ([fa8623d](https://github.com/bcgov/cas-registration/commit/fa8623de372b4ae459a5fce1c5fc86e9d17b04f6))
- add notes component ([38f4df3](https://github.com/bcgov/cas-registration/commit/38f4df39028d7e8c8ee859e658911ac0452a249b))
- adding api route to start a report ([badf154](https://github.com/bcgov/cas-registration/commit/badf1547ddaa96419a53d15c55a1852753facd9e))
- api endpoint to serve reporting dashboard operation data ([087fc9b](https://github.com/bcgov/cas-registration/commit/087fc9b01643fe0f383e4d8922de31e250c093e0))
- Generate coam app with NX according to [#1755](https://github.com/bcgov/cas-registration/issues/1755) ([43a9585](https://github.com/bcgov/cas-registration/commit/43a9585215cb47412531d6e38b6b21da398ccb63))
- Nx app Administration ([cc186ec](https://github.com/bcgov/cas-registration/commit/cc186ec4e2b6249bd79cafa0ed83305911816581))
- nx apps auth sharing ([cb20139](https://github.com/bcgov/cas-registration/commit/cb201390e6125f936b55527f3e22c0b48fc647fe))
- report version model ([b994303](https://github.com/bcgov/cas-registration/commit/b99430329f594def81d4f76980d7a783ef20f3ff))
- update contact - backend work ([07d7e77](https://github.com/bcgov/cas-registration/commit/07d7e776a43d31d44787ce8cc46df0117e027bd9))
- update operator form ([bd50834](https://github.com/bcgov/cas-registration/commit/bd50834f3649e447f79dd51d4dd811539c2729cc))

# [1.6.0](https://github.com/bcgov/cas-registration/compare/v1.5.2...v1.6.0) (2024-06-10)

### Bug Fixes

- pre-commit ([b782037](https://github.com/bcgov/cas-registration/commit/b782037e83e6a56c18d43ba50f814b4eefd30a68))
- restore file ([acb9dc8](https://github.com/bcgov/cas-registration/commit/acb9dc8e36b039c655d32f7d8b09cf87da52514e))
- terraform job's template to be time-bound ([e3e1f2c](https://github.com/bcgov/cas-registration/commit/e3e1f2c249e994c3644c04463bd49e0e4c7d3311))

### Features

- /dashboard-data api tests ([9e97dfa](https://github.com/bcgov/cas-registration/commit/9e97dfae9838c9f799321a25ee982a2ecdafce98))
- add single step task list form ([9836b35](https://github.com/bcgov/cas-registration/commit/9836b35c005de4e02ced108895844af389ff5ce2))
- adding database models for reporting operation and facility information ([05cff42](https://github.com/bcgov/cas-registration/commit/05cff429c384cf40d5bbbade6b0b6546b7e72f20))
- dashboard tiles API ([98dd809](https://github.com/bcgov/cas-registration/commit/98dd8099db2451fd2aeff80a78e4cf6eeedd1e5d))

## [1.5.2](https://github.com/bcgov/cas-registration/compare/v1.5.1...v1.5.2) (2024-05-14)

### Bug Fixes

- add start target to registration ([a08388c](https://github.com/bcgov/cas-registration/commit/a08388cc905af555f00298ad2013993ddddd5563))
- eslint errors ([1612cf4](https://github.com/bcgov/cas-registration/commit/1612cf4925f803b69e40e30f6a3d95483387ff01))
- ignore lint error in rep placeholder page ([b5abda2](https://github.com/bcgov/cas-registration/commit/b5abda2c37de4afff79b87d59b212befb52631e8))
- inconsistent config between rep and reg ([6ffd125](https://github.com/bcgov/cas-registration/commit/6ffd125eb62ef9a150324eaece5e5ae516ecef8c))
- linting errors ([378f34a](https://github.com/bcgov/cas-registration/commit/378f34a49f46b45d2592f27a4e9d0448760301c8))
- remove legacy registration build ([3e9d9ff](https://github.com/bcgov/cas-registration/commit/3e9d9ffc94c072218a4c45507972da3726e7cc29))
- remove vistigial asdf .tool-versions ([c231e71](https://github.com/bcgov/cas-registration/commit/c231e711a68b8ff5fc41884e2d221d42ab3b8051))
- remove vistigial pre-Nx package files ([4c3ff4b](https://github.com/bcgov/cas-registration/commit/4c3ff4b358d8e024e55796f28854c327060fd8e7))
- use --immutable flag in dockerfiles ([90cc2ea](https://github.com/bcgov/cas-registration/commit/90cc2eafa4ac0eda06b1dd328e33b868c316335a))
- use nx's testing command ([04eb791](https://github.com/bcgov/cas-registration/commit/04eb791698ddb09ec5423bd6802040f5838c7b5b))
- use pre-monorepo configs (no [@nx](https://github.com/nx) lint-conifg) ([a7fcc8b](https://github.com/bcgov/cas-registration/commit/a7fcc8b1ac2d95320ac9eb4b22b93dfa614f8f01))
- use proper directory and --immutable flag ([e0ae0d8](https://github.com/bcgov/cas-registration/commit/e0ae0d8b1c55314c25d4926dbed7526170444ce3))

## [1.5.1](https://github.com/bcgov/cas-registration/compare/v1.5.0...v1.5.1) (2024-05-02)

### Bug Fixes

- fix django sentry when not passing `DEBUG` env variable ([ed57157](https://github.com/bcgov/cas-registration/commit/ed57157fd55531a505673746a7c687223ec86eff))

### Reverts

- Revert "chore: temp commit to test pre-commit" ([947eb69](https://github.com/bcgov/cas-registration/commit/947eb6935174d2c16a4c0562368fa5ff1605b883))

# [1.5.0](https://github.com/bcgov/cas-registration/compare/v1.4.0...v1.5.0) (2024-04-30)

### Bug Fixes

- add operations filtering to industry user query ([3d13f2c](https://github.com/bcgov/cas-registration/commit/3d13f2cc573a6b3792d7755de1c4d4036ab9a988))
- fix passing redundant arg to `file_to_data_url` function ([c164baf](https://github.com/bcgov/cas-registration/commit/c164baf921363c6d98bb0f1548a5f26bf1596baf))
- row count for non server paginated datagrids ([4d18ac4](https://github.com/bcgov/cas-registration/commit/4d18ac4a3e144e6c60fa0e9d8ef253abbbc0dbdb))

### Features

- check required field value ([a944a7d](https://github.com/bcgov/cas-registration/commit/a944a7de8de12a2c2acd97f4868d4e246df7bb12))
- send new operator and access request email ([589dcb3](https://github.com/bcgov/cas-registration/commit/589dcb365ee9e80e4c7318cd0cf07d549dea9639))

## [1.4.1](https://github.com/bcgov/cas-registration/compare/v1.4.0...v1.4.1) (2024-04-24)

### Bug Fixes

- add operations filtering to industry user query ([3d13f2c](https://github.com/bcgov/cas-registration/commit/3d13f2cc573a6b3792d7755de1c4d4036ab9a988))
- row count for non server paginated datagrids ([4d18ac4](https://github.com/bcgov/cas-registration/commit/4d18ac4a3e144e6c60fa0e9d8ef253abbbc0dbdb))

# [1.4.0](https://github.com/bcgov/cas-registration/compare/v1.3.0...v1.4.0) (2024-04-23)

### Bug Fixes

- decline all user_operators tied to operator ([a45f6d5](https://github.com/bcgov/cas-registration/commit/a45f6d535747c421485fb741468817e17adc552b))
- enable experimental aria v7 feature in mui datagrid ([846b584](https://github.com/bcgov/cas-registration/commit/846b584841b7fe72b4d760597659d914de878cca))
- fix is-approved-admin-user-operator endpoint ([31359e3](https://github.com/bcgov/cas-registration/commit/31359e387817962949de6b9278e4f9687a3ab8be))
- install yarn dependencies in github actions if cache doesn't exist ([9392ff3](https://github.com/bcgov/cas-registration/commit/9392ff3540072228347f9a900f7ac212322fe563))
- owasp zap docker image ([d0c79fb](https://github.com/bcgov/cas-registration/commit/d0c79fb6e03153ee2842942f69653c51da9efcb7))

### Features

- add accessibility tests ([0b930d2](https://github.com/bcgov/cas-registration/commit/0b930d2ad07ab4928b76ea544d9aebf1082e877d))
- add common app files and configs ([22479ad](https://github.com/bcgov/cas-registration/commit/22479ad6be50ae0805484a9da93f9046361d40d1))
- send access request email for operator with admin ([496e775](https://github.com/bcgov/cas-registration/commit/496e775a4cdb2103ff0c51a101e560308f899962))

# [1.3.0](https://github.com/bcgov/cas-registration/compare/v1.2.3...v1.3.0) (2024-04-11)

### Bug Fixes

- change version compatability for vite to match vitest ([41326a2](https://github.com/bcgov/cas-registration/commit/41326a2cff82717f0b7140ccabe0b8c848922bbc))
- force nx to build each time ([1df9e56](https://github.com/bcgov/cas-registration/commit/1df9e5614b29a5560748ae7b50771830ff7eba57))
- global vi not being recognized by eslint/ts ([bf1b674](https://github.com/bcgov/cas-registration/commit/bf1b6746bdcc6d0ca605a47581c44ec3be4bcff8))
- next css not working without id ([c43398b](https://github.com/bcgov/cas-registration/commit/c43398b510735349928e3043f32b8ad6ae5c0099))
- remove testing branch from workflow ([9fdddfd](https://github.com/bcgov/cas-registration/commit/9fdddfde8a0e561f120806882884fa220adc55ea))
- shorten service name ([f0524d1](https://github.com/bcgov/cas-registration/commit/f0524d1fbbfdd0897da2655c3b0d375087df233f))
- test failing due to float in place of int ([551f0eb](https://github.com/bcgov/cas-registration/commit/551f0eb885f8597088d7e3f8ab3bb20a15b82044))
- test failing due to missing prop/child ([f224ee5](https://github.com/bcgov/cas-registration/commit/f224ee5a423a793ab989a1fb50aba27a1cf4fae8))
- update config to handle depricated key ([0ea4380](https://github.com/bcgov/cas-registration/commit/0ea43803c49a5ece55124961ed69c4df6e381ee5))
- use only named exports for components ([8af6986](https://github.com/bcgov/cas-registration/commit/8af698614d934dd1d753aa05b75256b8a1bacafc))
- vitest CJS depricatation ([b7dcae1](https://github.com/bcgov/cas-registration/commit/b7dcae11b8163f66fec4e8ae4ef092320b79de1f))

### Features

- add Nx project reporting app and shared_components placeholders ([07a5147](https://github.com/bcgov/cas-registration/commit/07a514707b50f3730a9ad52cb285600e8fba3c38))
- add Nx project reporting app and shared_components placeholders ([cfc8043](https://github.com/bcgov/cas-registration/commit/cfc80435f439e46df1aa2b320f1e52fb1ea2ac17))
- add tailwindcss config to monorepo ([bc4cf11](https://github.com/bcgov/cas-registration/commit/bc4cf11c6c129d0e1aaf22dfa98c229066ec7032))
- main page with BC headers ([4089161](https://github.com/bcgov/cas-registration/commit/408916149b22b724d63792b2219d3cb4bd455734))
- middleware to redirect auth and non-auth pages ([9a1e5d4](https://github.com/bcgov/cas-registration/commit/9a1e5d401d335d322910d2c802da2279ba8c2e1e))

## [1.2.3](https://github.com/bcgov/cas-registration/compare/v1.2.2...v1.2.3) (2024-04-10)

### Bug Fixes

- cas_pending login ([55d0265](https://github.com/bcgov/cas-registration/commit/55d02653c975bd586243b5c523c737922f234b09))
- click submit ([c95f309](https://github.com/bcgov/cas-registration/commit/c95f309c28c78d94e4b4c34d23f3618a29ec3c8e))
- happo Add a new operator ([7554566](https://github.com/bcgov/cas-registration/commit/75545661fa2209742a14d2160c6ef9afcca0012d))
- happo Add a new operator\default ([007e0f2](https://github.com/bcgov/cas-registration/commit/007e0f2cf7d49b8152672d46098047a4f6bd965f))
- happo create a new operator ([cfc8fa1](https://github.com/bcgov/cas-registration/commit/cfc8fa17bfb73d12ef2bf30bec10c66beaa85ff2))
- run e2e report always ([60c787e](https://github.com/bcgov/cas-registration/commit/60c787e96a1e108cf1356c82b4357eeb5abc5214))

## [1.2.2](https://github.com/bcgov/cas-registration/compare/v1.2.0...v1.2.2) (2024-04-04)

### Bug Fixes

- set user audit columns for documents ([570f6d8](https://github.com/bcgov/cas-registration/commit/570f6d8a3bd0e1b2c1a06958bdb3cefb2e8964ca))

## [1.2.1](https://github.com/bcgov/cas-registration/compare/v1.2.0...v1.2.1) (2024-04-03)

### Bug Fixes

- set user audit columns for documents ([570f6d8](https://github.com/bcgov/cas-registration/commit/570f6d8a3bd0e1b2c1a06958bdb3cefb2e8964ca))

# [1.2.0](https://github.com/bcgov/cas-registration/compare/v1.0.0...v1.2.0) (2024-03-20)

### Bug Fixes

- e2e dashboard screenshot diffs due to role difference ([d975c4d](https://github.com/bcgov/cas-registration/commit/d975c4d7d6e0a0db2b2b72d11c74146b819d7720))
- hide prime admin review when operator is declined ([e4079f4](https://github.com/bcgov/cas-registration/commit/e4079f4fbb4f78776124b109505876faf81a4bd2))
- industry user review uuid ([657e1a3](https://github.com/bcgov/cas-registration/commit/657e1a31cf7102be20749df45e8fd295510fc66c))
- phone widget lockout error ([9dd2982](https://github.com/bcgov/cas-registration/commit/9dd29828ae6e37c183f32edec2e2ef51793a0904))
- store the state to prevent losing it when switching tabs ([2e8a25b](https://github.com/bcgov/cas-registration/commit/2e8a25b80810108947dc99e7f0a176be87f9685b))

### Features

- add carbon tax exemption link ([3b21fe5](https://github.com/bcgov/cas-registration/commit/3b21fe5ce173ab7663dce6c1a7cd613c4703fe0c))
- add db setup for IO ([a02aa75](https://github.com/bcgov/cas-registration/commit/a02aa75a889cc37d88c44692117491dfa105ec1e))
- add happo e2e finalize job ([c1b1f63](https://github.com/bcgov/cas-registration/commit/c1b1f63fa19d0bca29e9953873f565d322d58a84))
- breadcrumb UUID transforms to text ([ad7c00f](https://github.com/bcgov/cas-registration/commit/ad7c00ffd773dc34f15ece2c6e09319296ce5f95))
- configure session maxAge ([b348fe1](https://github.com/bcgov/cas-registration/commit/b348fe175f2cf948225d9da4f5e423df30a1adc0))
- e2e ci cache ([d18e0df](https://github.com/bcgov/cas-registration/commit/d18e0dfca0a7dde20d169a0f17d36944ec2fdebc))
- home route test ([f3470b2](https://github.com/bcgov/cas-registration/commit/f3470b2b2437a34c34b2f2422c23ff43fcba88f8))
- replace uuid with user_friendly_id in user operator datagrid ([a648ff1](https://github.com/bcgov/cas-registration/commit/a648ff1776768ab67437c9d7accfff09825290da))
- setup happo ([f0b5c6e](https://github.com/bcgov/cas-registration/commit/f0b5c6ec91d81880c4f25726daf1736e37b97847))

# [1.1.0](https://github.com/bcgov/cas-registration/compare/v1.0.0...v1.1.0) (2024-03-12)

### Bug Fixes

- flaky profile update test ([f9d8218](https://github.com/bcgov/cas-registration/commit/f9d821868e26a214a5016dec274d9f578f9a65c0))
- store the state to prevent loosing it when switching tabs ([2e8a25b](https://github.com/bcgov/cas-registration/commit/2e8a25b80810108947dc99e7f0a176be87f9685b))

### Features

- add db setup for IO ([a02aa75](https://github.com/bcgov/cas-registration/commit/a02aa75a889cc37d88c44692117491dfa105ec1e))
- add not-found selector ([008b0e7](https://github.com/bcgov/cas-registration/commit/008b0e7a7a338dc7093fc7275b24ecca193128c2))
- breadcrumb UUID transforms to text ([ad7c00f](https://github.com/bcgov/cas-registration/commit/ad7c00ffd773dc34f15ece2c6e09319296ce5f95))
- home route test ([f3470b2](https://github.com/bcgov/cas-registration/commit/f3470b2b2437a34c34b2f2422c23ff43fcba88f8))
- route access by role ([3e174e2](https://github.com/bcgov/cas-registration/commit/3e174e237dca6133530883615f2b8b0879c23197))
- route for new user ([526a6f0](https://github.com/bcgov/cas-registration/commit/526a6f07a466e3e2fe97a6912b3da0b196bbd44f))
- select operator breadcrumb title ([1489789](https://github.com/bcgov/cas-registration/commit/14897899371878da22ce614888db9822586f9412))
- select operator title ([edf6f06](https://github.com/bcgov/cas-registration/commit/edf6f06261d944fcb5b368ec97d668a320ba0f06))

# [1.0.0](https://github.com/bcgov/cas-registration/compare/v0.1.1-beta-7...v1.0.0) (2024-02-29)

### Bug Fixes

- add error message for statutory declaration field ([8cf1007](https://github.com/bcgov/cas-registration/commit/8cf1007c443fb1791fcf5c6d9714048250e4aaf6))
- adjust role assignment for approved user operators ([60d8cde](https://github.com/bcgov/cas-registration/commit/60d8cdeac85abc108d97d22283a113e096429f51))
- auth token refresh ([669cb03](https://github.com/bcgov/cas-registration/commit/669cb030a08440dcfbe614d3d221f677f65e559e))
- dashboard tiles responsive width ([12796f5](https://github.com/bcgov/cas-registration/commit/12796f55f8c8ad05edfede86ad2d7ac9ec47dc23))
- Declined user_operator records do not block subsequent requests ([e7435ce](https://github.com/bcgov/cas-registration/commit/e7435ce72c189cbbb4c73bc94b4feb96d2e5da49))
- disable submit only on loading ([1902fdc](https://github.com/bcgov/cas-registration/commit/1902fdcd39251d016a4b40fbf6094bdc9aad2268))
- display changes requested section ([b36fbb4](https://github.com/bcgov/cas-registration/commit/b36fbb4ee1b2b28bc520f5cd9ba0cd848a98ec73))
- fix authorize definition causing incorrect declined message ([40b4ce0](https://github.com/bcgov/cas-registration/commit/40b4ce0b58214abe2897d7cbc3e2d4f87152fcd2))
- fix issue not showing api errors on the form ([ef35098](https://github.com/bcgov/cas-registration/commit/ef35098ceba28f9d4f81afe1c38f99e2fed95151))
- global db setup for auth roles ([8ae016c](https://github.com/bcgov/cas-registration/commit/8ae016c6f1c977effd0a9712c89854e41929f3ac))
- hide parent operator button if form is disabled ([05ffbca](https://github.com/bcgov/cas-registration/commit/05ffbcac214285213aca67c99e379ca04891d9cf))
- k6 params error ([b00bb72](https://github.com/bcgov/cas-registration/commit/b00bb72fb48103ee7b69bf0b839aab3087df309a))
- mui data grid needs id ([172af01](https://github.com/bcgov/cas-registration/commit/172af0123a8fcf8f55907779ffa5a636dac37675))
- next auth signOut ([96e3ac9](https://github.com/bcgov/cas-registration/commit/96e3ac9d4468066ba01f0d0a6f4c25984be076f7))
- nextauth ([831b340](https://github.com/bcgov/cas-registration/commit/831b34004b8f3c04c482f13b473a489f0043c567))
- operator search results order and text alignment ([1506e2c](https://github.com/bcgov/cas-registration/commit/1506e2c9a68b82812c526fdd55c8c871d2322cb4))
- pass empty string for null bcghg id field ([be1d55c](https://github.com/bcgov/cas-registration/commit/be1d55cd6185d381327381002e7e7775f8ee06b2))
- profile all roles ([177dc21](https://github.com/bcgov/cas-registration/commit/177dc210216408f21c6d5103a9e1a14590683bc7))
- redirect select operator based on operator status ([a47e787](https://github.com/bcgov/cas-registration/commit/a47e787bcc20865cc4fa21babbb73224e917da46))
- remove GHG emission report boolean section ([5c2123a](https://github.com/bcgov/cas-registration/commit/5c2123a1809b3aee6bb4327eca0255ab0fc7497c))
- set operations table timezone ([c091556](https://github.com/bcgov/cas-registration/commit/c0915561e1f4013782c78b1371e599e4aab7a12f))
- set operations table timezone ([14af261](https://github.com/bcgov/cas-registration/commit/14af2616bf01d83f1a1ce14649db899c978f134e))
- the PUT endpoint for updating an operator is restricted to admins ([26511ab](https://github.com/bcgov/cas-registration/commit/26511ab12ca636dbc491b9d46aef8c7d5d2f0f79))
- Tile logic fixed so blank dashboard is not seen when operator is in draft state ([344a06c](https://github.com/bcgov/cas-registration/commit/344a06c2af671b659f03e7a2a370503b19854990))
- typo ([336b856](https://github.com/bcgov/cas-registration/commit/336b85684eff8c89a3dacbf7e240c6e2bad81433))
- update error message when declining prime admins ([4d40e3a](https://github.com/bcgov/cas-registration/commit/4d40e3aa7d5fc62bc9eb5a7b1d222ec163afb477))
- use permenant redirect function instead of redirect ([e4b4322](https://github.com/bcgov/cas-registration/commit/e4b4322217a5e607592b56e870ac1b5bf1f719f4))

### Features

- add icons to dashboard tiles ([6584cec](https://github.com/bcgov/cas-registration/commit/6584cec8d358f17a5949215ca4a3062bd55fc36c))
- add missing urls to home page ([d7b4151](https://github.com/bcgov/cas-registration/commit/d7b41519a7fac853a33b8d4706d74af77f4bc5c6))
- add notification icon to dashboard tiles ([38a4e48](https://github.com/bcgov/cas-registration/commit/38a4e48efd88624bede291b702976c4a8baa94f3))
- e2e test for dashboard tiles ([2fba2cc](https://github.com/bcgov/cas-registration/commit/2fba2cc3caec21634b9929e0f65fecb96c443d87))
- k6 frontend tests basic setup ([dbc583e](https://github.com/bcgov/cas-registration/commit/dbc583e88b92a68ee9d898ff45ab9bbec152d300))
- notification tile font is bold ([40045ed](https://github.com/bcgov/cas-registration/commit/40045edab95651d5dcd3a503f2847933336daffd))
- profile page all roles ([9089794](https://github.com/bcgov/cas-registration/commit/9089794271e28785366fe0828fde6e11143990ae))
- redirect user operators with a draft operator to form ([edeb152](https://github.com/bcgov/cas-registration/commit/edeb152e1eb90dbc47d723de866bea07d88b0b0c))

### Reverts

- Revert "chore: 2nd temp testing" ([4e5770b](https://github.com/bcgov/cas-registration/commit/4e5770b8bb7fca388b7dda6ab675125d1bfad33d))
- Revert "chore: temp testing commit" ([09cf1d9](https://github.com/bcgov/cas-registration/commit/09cf1d9d4581a48ff442d538245f5b187cc976dd))

## [0.1.1-beta-7](https://github.com/bcgov/cas-registration/compare/v0.1.1-beta-6...v0.1.1-beta-7) (2024-02-15)

### Bug Fixes

- add operator form draft status ([7c0e1e0](https://github.com/bcgov/cas-registration/commit/7c0e1e0020f8c2756d9340ffb6f71a7232a7802a))
- empty string causing url widget validation to trigger ([015713f](https://github.com/bcgov/cas-registration/commit/015713f943bc857be34f01ccf32cfdf7e8cd68bf))
- exclude operators that have an approved admin ([f5b8a7c](https://github.com/bcgov/cas-registration/commit/f5b8a7cdbd4bda784d5fa9b5185598576bbd985d))
- lines-between-class-members ([34372a2](https://github.com/bcgov/cas-registration/commit/34372a283e651a3b896d93979f2b6191c18267b9))
- operations dashboard link ([28eae32](https://github.com/bcgov/cas-registration/commit/28eae32a7e6aee0ff4130cd5d4921bef36ca6b23))
- operator_mailing_address_id ([a09229e](https://github.com/bcgov/cas-registration/commit/a09229efa72667a08ddfbec8830623c9cb27fc9a))
- remove use effect from url widget ([a6a8887](https://github.com/bcgov/cas-registration/commit/a6a8887a7ec5a636b9779cccc54ecb48567bcf08))
- review component alert message display ([b33979d](https://github.com/bcgov/cas-registration/commit/b33979d7348b18ba423323d4f5d5ecc4d5d7d4ec))
- update user operator fixtures ([e812306](https://github.com/bcgov/cas-registration/commit/e812306473ef20ec63ec41b40fa3701f5f4158c8))
- user operator out schema ([681df7c](https://github.com/bcgov/cas-registration/commit/681df7cf805f12c7befcd187f48ae6c09c6445c6))

### Features

- add bceid business name to user operator user info ([2c23df8](https://github.com/bcgov/cas-registration/commit/2c23df8b4fa2a0da25efb8ae31c647b3cf68874f))
- exclude approved user operators from internal dashboard ([f85bd19](https://github.com/bcgov/cas-registration/commit/f85bd19b49ee33f9c113dbe24ea39c96072ea2ac))
- expand user operator accordions that need review ([e6e5909](https://github.com/bcgov/cas-registration/commit/e6e5909f54c286e4bc55fffcc7050af0a31f76a2))
- reset prime admin review on new operator approval ([c0ca365](https://github.com/bcgov/cas-registration/commit/c0ca36556f73ef6f9f487a6bdf0a7437fba8c9fa))
- return user data with user operator out schema ([597adfe](https://github.com/bcgov/cas-registration/commit/597adfe5bc1d52b9ec7354cc27db1c98b5ba2077))
- use multistep accordion for user operator internal review ([e5cef93](https://github.com/bcgov/cas-registration/commit/e5cef93ba8055f267f28dba765a905ebe7d72dee))

### Reverts

- remove idir wf ([c000e05](https://github.com/bcgov/cas-registration/commit/c000e05489b9a7f63e5520ec0df748e03ca3ce3b))

## [0.1.1-beta-6](https://github.com/bcgov/cas-registration/compare/v0.1.1-beta-5...v0.1.1-beta-6) (2024-02-13)

### Bug Fixes

- access requests nextjs server component error ([e2ef027](https://github.com/bcgov/cas-registration/commit/e2ef027d5016037e2c7b42177b76476ddf98b627))
- add back new operator message ([bf7b970](https://github.com/bcgov/cas-registration/commit/bf7b9708f9695c54d5478820831173bc170b7e28))
- add k6 operation api query param ([c217fb0](https://github.com/bcgov/cas-registration/commit/c217fb0f7b5d244402c4f7756551638dbfc29976))
- add operations form section route for industry users ([e2e445e](https://github.com/bcgov/cas-registration/commit/e2e445ee1d463b8a3527a5251bd2ce1c3567a2cf))
- add optional chaining to datagrid map ([90735d6](https://github.com/bcgov/cas-registration/commit/90735d623990ff96370f74ab4d2a153bf5576c19))
- add page size to mui datagrid page size options ([2c6f680](https://github.com/bcgov/cas-registration/commit/2c6f680c1fede242e870a43f2837d143fc1d8ade))
- add partial user profile form data type ([a93c91b](https://github.com/bcgov/cas-registration/commit/a93c91b0297d54eb0ce5b5a0c04620df9b70a061))
- add unique constraint to user_operator table ([d54db0f](https://github.com/bcgov/cas-registration/commit/d54db0f1e1e47ff03968e32d3c2fb91f953093fe))
- attachments in undefined state ([cc9dc39](https://github.com/bcgov/cas-registration/commit/cc9dc390ae92b9ea115689035acb9d6406f22aba))
- datagrid sorting ([ba5f828](https://github.com/bcgov/cas-registration/commit/ba5f8281234dc5b0d1da35825595384c6af2a560))
- force accordion state rerender ([07291c7](https://github.com/bcgov/cas-registration/commit/07291c7d0297d15e57041d44986a1e583e16cbae))
- operation form operators business structures field ([c33c0df](https://github.com/bcgov/cas-registration/commit/c33c0df5e9ffeff9af8ad5c17a5d6877ecc8cc83))
- operation out schema rebase error ([1cddda0](https://github.com/bcgov/cas-registration/commit/1cddda03c96e3eb439e641f8ca87628ca32c43ca))
- operations k6 test due to rebase changes ([88e4bf0](https://github.com/bcgov/cas-registration/commit/88e4bf0157f834643a62f497d19c1b89731f4a19))
- operator out schema mailing address fields ([942ee21](https://github.com/bcgov/cas-registration/commit/942ee2115028a954c183a137e795ca3ecea0765c))
- optimize get operations endpoint ([3dcabfb](https://github.com/bcgov/cas-registration/commit/3dcabfb56d8666b6ca2a0c61bb0e89d70fed15b9))
- remove session loading from header ([ac9cd33](https://github.com/bcgov/cas-registration/commit/ac9cd33b1c5c458d44c5e716cfff9db9156470ee))
- user operation list out for pagination out ([c00b371](https://github.com/bcgov/cas-registration/commit/c00b3714defab5838b61aa975ba23092371152b3))
- user operator form industry user conditionals ([e9b22c9](https://github.com/bcgov/cas-registration/commit/e9b22c974d23660958b7c9409a082aa1e73f2fcf))
- user page datagrid regression ([22e24be](https://github.com/bcgov/cas-registration/commit/22e24be050efeb26876bfe20602eb80d4c0ac3ae))
- user profile null values not triggering form validation ([6e1831e](https://github.com/bcgov/cas-registration/commit/6e1831e358dc90be458c69f4017f19386715ee02))

### Features

- add accordion component ([c6a9afb](https://github.com/bcgov/cas-registration/commit/c6a9afb097ab5d93f65a3b8076d0fa309e6de50f))
- add multistep accordion expand/collapse all buttons ([28e8523](https://github.com/bcgov/cas-registration/commit/28e852374e239e924232a1315561edc848dce30e))
- add numbered pagination component to mui datagrid ([00596e2](https://github.com/bcgov/cas-registration/commit/00596e2230892d9c269a720102a4af92434e0136))
- add operation internal review form ([4d338bf](https://github.com/bcgov/cas-registration/commit/4d338bf6c6e422a7c6f390988ac6a424a48686a0))
- add operations internal user ui schema ([8ada345](https://github.com/bcgov/cas-registration/commit/8ada345c5f0ac0823d32c40f03136e40a63642a8))
- add operator datagrid serverside sorting ([5f65124](https://github.com/bcgov/cas-registration/commit/5f6512476434ed451223225794f53c4c31d4f8e8))
- add server pagination sort support for operation datagrid ([40e4616](https://github.com/bcgov/cas-registration/commit/40e4616ff99b7fa4ea04efc44753171759572939))
- add server pagination to operator datagrid ([90fcddd](https://github.com/bcgov/cas-registration/commit/90fcdddce130157cce5723f0070efb6e80204f45))
- conditionally show the operations tile ([f0da614](https://github.com/bcgov/cas-registration/commit/f0da614c0dc2de9d3ec7f1536717ae6130b1bef9))
- enable server side pagination for operations datagrid ([82816e9](https://github.com/bcgov/cas-registration/commit/82816e9e0c1a0785f057fbce5851049981c1ff8f))
- make internal user operation schema ([55a673a](https://github.com/bcgov/cas-registration/commit/55a673a1fac9c0ba55f2e3c24a18159f6f038b17))

## [0.1.1-beta-5](https://github.com/bcgov/cas-registration/compare/v0.1.1-beta-4...v0.1.1-beta-5) (2024-02-02)

### Bug Fixes

- add physical_street_address field to `OperatorOut` schema ([1234fb4](https://github.com/bcgov/cas-registration/commit/1234fb4b6ddee5f4474b02e81d6e1f3d33f6d99e))
- comment multiple operators schema serverside code ([19adef6](https://github.com/bcgov/cas-registration/commit/19adef6e9e9c8b4addfeab32f2626162e0b7c71d))
- correct operation id ([d466ad8](https://github.com/bcgov/cas-registration/commit/d466ad844347bd3e823e85568670ff2b448e4e72))
- document api error ([bf57458](https://github.com/bcgov/cas-registration/commit/bf574580967a9da48748a99bcf82f12bce76a759))
- don't save address when creating operations contact ([5f1bef7](https://github.com/bcgov/cas-registration/commit/5f1bef762d68b4227e6c7f55061a89f7f2e507cf))
- ensure configMap is in place prior to TF job ([64ba3f6](https://github.com/bcgov/cas-registration/commit/64ba3f6c02e8a59bfba22605b466b6ac74e69712))
- error occurred in Server Component render ([ead3d47](https://github.com/bcgov/cas-registration/commit/ead3d47368a4ba7724661ed1e86733a19243d923))
- operation form point of contact required fields ([8bcf310](https://github.com/bcgov/cas-registration/commit/8bcf3109eee86f955a604d768e9a1b8804f8df4c))
- operators can only edit their own operations ([72cdae0](https://github.com/bcgov/cas-registration/commit/72cdae037e71f97038a51d06f03836aefb6b2aa6))
- re-enable pagination on mui datagrid ([d91a9d8](https://github.com/bcgov/cas-registration/commit/d91a9d8510fee76d8abc73f3fa18c3f6755e5cdb))
- rebase error ([d0a6dc2](https://github.com/bcgov/cas-registration/commit/d0a6dc2d3592de03a99d5f949fb15de0510a85e3))
- rename point of contact field ([df8a55c](https://github.com/bcgov/cas-registration/commit/df8a55c4dab06dcfb3df45d7d0d54e18879f2915))
- save bceid business name/guid to database ([dd958c6](https://github.com/bcgov/cas-registration/commit/dd958c632ad7adf346587f8abfe56769e6ad5c39))

### Features

- add ghg emissions section title ([c730b1d](https://github.com/bcgov/cas-registration/commit/c730b1d0240731aa6bc0473485df509e2fc485da))
- add opt in note ([e7772f5](https://github.com/bcgov/cas-registration/commit/e7772f55a76efd858953bbd4c33a0b72af0d0c17))
- add opt in section title ([94eb7b8](https://github.com/bcgov/cas-registration/commit/94eb7b8de36e4a01bcd46a7ee7d9e60b579aba6c))
- add point of contact section title ([fb7c43a](https://github.com/bcgov/cas-registration/commit/fb7c43a1cf49e6eb3f52380a2e32691de7d9acf7))
- bcghg id readonly ([6c001d6](https://github.com/bcgov/cas-registration/commit/6c001d6b84dd176c0e97a454f03fa3093993f9dc))
- make address field optional ([dc64ad7](https://github.com/bcgov/cas-registration/commit/dc64ad71f80c88a9afa19fab74129849594f9b27))
- operations api add save_contact query param ([db2e82b](https://github.com/bcgov/cas-registration/commit/db2e82b381e1f98c2001fcac5075d21a9bd458fc))
- update landing page design ([aafdcb2](https://github.com/bcgov/cas-registration/commit/aafdcb2eccd45fd0eb9b921961f2cb39fcf1c21c))

## [v0.1.1-beta-4](https://github.com/bcgov/cas-registration/compare/0.1.1-beta-3...v0.1.1-beta-4) (2024-01-26)

### Bug Fixes

- add noopener to bceid signup link ([9954743](https://github.com/bcgov/cas-registration/commit/99547435bf99728f2f309490ac1d95393c2e1a36))
- add status pill support for not registered status ([0e0d4f8](https://github.com/bcgov/cas-registration/commit/0e0d4f8928007cfc68664214d9c0bb570d91d7a3))
- allow custom redirect ([7c8f17f](https://github.com/bcgov/cas-registration/commit/7c8f17f600ee69f8112351aa6fe4ebdfc6209548))
- archive contacts error ([c27c3fb](https://github.com/bcgov/cas-registration/commit/c27c3fb1f0d003ee1c4d7c04786b0bba93f12c35))
- boro id fixture causing operations model tests to fail ([1c5b36d](https://github.com/bcgov/cas-registration/commit/1c5b36d955918a4972e8298057a70d2336b76640))
- cas_analyst operator dashboard url ([f71c892](https://github.com/bcgov/cas-registration/commit/f71c892d26ef84dcc34fd4b8750d1f810802b999))
- cas_analyst user operator form section route ([32c4936](https://github.com/bcgov/cas-registration/commit/32c493664d01085f62b421ef410807d29db00c60))
- conditionally render new operator message ([48b2f21](https://github.com/bcgov/cas-registration/commit/48b2f219e2d4747a29c25ed27abf695c72f20341))
- create senior operator id error ([18ea374](https://github.com/bcgov/cas-registration/commit/18ea37421c859a38b4c34ada6768518f2e29bab6))
- disable user operator editing for cas internal users ([214c112](https://github.com/bcgov/cas-registration/commit/214c112633cc9defd5cd32b75b4ae306fece2799))
- edit error when user role is reporter ([014f635](https://github.com/bcgov/cas-registration/commit/014f635ae7cfc568770785564e8e59df56dfb608))
- header title responsiveness ([f7e3373](https://github.com/bcgov/cas-registration/commit/f7e33732027b33a48559b4a29e3b60d7db7fd774))
- hide duplicate heading in field template ([bd2b5b8](https://github.com/bcgov/cas-registration/commit/bd2b5b8508226117b1ddfe9300b2c18f7c83d107))
- home page grid container takes up remaining width ([500d73f](https://github.com/bcgov/cas-registration/commit/500d73f583031c083f75dc0f18965b4d4751cd14))
- homepage grid responsive order ([344d229](https://github.com/bcgov/cas-registration/commit/344d2292d4e41acb3645c41dc56ab128360f5417))
- incorrect logic to show missing operator information message ([b55bb20](https://github.com/bcgov/cas-registration/commit/b55bb204d1d52fae8687feeafc3ece87f6b1b101))
- landing page grid full screen ([3223989](https://github.com/bcgov/cas-registration/commit/32239897dbd24ae99987c1a19ac2b4209146fddc))
- missing business_structure field error ([61d1d5e](https://github.com/bcgov/cas-registration/commit/61d1d5ed61efef718919b0c9c5394de7624b97f2))
- move datagrid flex column ([ff37e9f](https://github.com/bcgov/cas-registration/commit/ff37e9fa5524703935a52971e049b31bfc1777de))
- multistep header divider regression ([d0aef5f](https://github.com/bcgov/cas-registration/commit/d0aef5f8465f18b1f7de2a48fdebaec3e4fe8cb2))
- operations form missing header ([a728f93](https://github.com/bcgov/cas-registration/commit/a728f93212aef129a14f96f46e9505b1aa238aab))
- operator redirect route ([ab5f61a](https://github.com/bcgov/cas-registration/commit/ab5f61af9d33c926d3563e9d31ee913b91cd8203))
- pending message regression ([2cad452](https://github.com/bcgov/cas-registration/commit/2cad4521732b89803352eaf88db1a451ecc72470))
- pre commit error ([2b15341](https://github.com/bcgov/cas-registration/commit/2b1534133093e259a7e1f6c5b73b439450745649))
- rebase error ([3770fe5](https://github.com/bcgov/cas-registration/commit/3770fe5c532db8450f086a723e73afd285940796))
- rebase error ([c724624](https://github.com/bcgov/cas-registration/commit/c7246241fe666ad8f1a2fda5cea6dea10c1ff0c7))
- rebase errors ([eae3513](https://github.com/bcgov/cas-registration/commit/eae35130a1fde007ac3cfed9b3bb11867e2204d1))
- redirect to form for pending status on select operator page ([dfd6136](https://github.com/bcgov/cas-registration/commit/dfd613609ecd4598414196657b000069344a8a8f))
- remove placeholder text ([bb2b9a7](https://github.com/bcgov/cas-registration/commit/bb2b9a7c3245773867197b7ae57cdfa774219788))
- revalidation error ([ff9b262](https://github.com/bcgov/cas-registration/commit/ff9b262f6cb651abd0a20bb48402f8c7e5d3e29b))
- revert user operator form api logic ([2e36c0b](https://github.com/bcgov/cas-registration/commit/2e36c0bbd0698c55683b98c0267312303ad36668))
- save user_operator after setting role ([eb9e6a3](https://github.com/bcgov/cas-registration/commit/eb9e6a3bb99ff9ac13f63154dcc0594d1ef3387c))
- select operator api url ([2629ee1](https://github.com/bcgov/cas-registration/commit/2629ee1aeb8bf1dd8679286d117ee2762b0678d3))
- set flex: 1 to datagrid columns to expand if user zooms out ([f1a7639](https://github.com/bcgov/cas-registration/commit/f1a7639d2c5c7c7a0acfe83cc8c7af5cd7e04eb7))
- status enum import ([b272122](https://github.com/bcgov/cas-registration/commit/b2721227d66ae419c91a43b8ce3a971a1a997d62))
- test dummy data sonarcloud issue ([33ed9f8](https://github.com/bcgov/cas-registration/commit/33ed9f8734749d987967ad2cd14461cd3a8edaa4))
- undo contact form operator id change ([cfbb634](https://github.com/bcgov/cas-registration/commit/cfbb6342b7bf0922f27e85f9b44fa78dddb2bcb5))
- update imports after rebase ([a109347](https://github.com/bcgov/cas-registration/commit/a1093470f38cd5d4bf7380c550b7f69bda317242))
- update user operator on save ([b3c6cd0](https://github.com/bcgov/cas-registration/commit/b3c6cd01b617ad67e5fafda4ee567b3d08a93ffa))
- update user operator tests after rebase ([6d89e01](https://github.com/bcgov/cas-registration/commit/6d89e01f3bf2bcac6136cb750df01603c385d721))
- use operator revalidation ([de74182](https://github.com/bcgov/cas-registration/commit/de7418245a591179a08698acbbf9694e709a5aac))
- user can only fetch own user operators ([bea8995](https://github.com/bcgov/cas-registration/commit/bea8995be2bdf94b3499f0cb9105722b11b63f12))
- user operator api regression ([58f09bc](https://github.com/bcgov/cas-registration/commit/58f09bc3c6489d149ab72737b108bdacb83e0745))
- user operator contact returns user operator id ([355cf19](https://github.com/bcgov/cas-registration/commit/355cf198485cc3eaa74cf074d9b73d21fdeb7a79))
- user operator form missing header ([e0e986b](https://github.com/bcgov/cas-registration/commit/e0e986bb14b113bbae6a80cffa40c216ca51f0e3))
- user operator form url ([8397b26](https://github.com/bcgov/cas-registration/commit/8397b26ace64f559e1d507cd5455d3c305399293))
- user operator get api error for cas users ([6ff9957](https://github.com/bcgov/cas-registration/commit/6ff9957268476b3e8f2109d32c361180cd281825))
- user operator get api rebase regression ([d125a5f](https://github.com/bcgov/cas-registration/commit/d125a5ff4088274e42b810e6df9f64310a444e3e))
- user operator multistep route for cas internal ([6f126ca](https://github.com/bcgov/cas-registration/commit/6f126ca52adbc3fabef07ccd21cfc31455e1c406))
- user operator redirect url ([ea65b56](https://github.com/bcgov/cas-registration/commit/ea65b56146be6a89585277b3f38e68c476030f5e))
- user operator tests ([5811eac](https://github.com/bcgov/cas-registration/commit/5811eac5b59edf20fa27a6db9add338da16a145b))
- user operator typescript error ([36e372b](https://github.com/bcgov/cas-registration/commit/36e372b76ae4478d5fe80e2e5169f1b6f90836e6))
- user operator typescript error ([17d7ef8](https://github.com/bcgov/cas-registration/commit/17d7ef8c9deb0343f3723cb4691e90b63cfbea94))

### Features

- add bceid business env var and use on landing page ([8694898](https://github.com/bcgov/cas-registration/commit/8694898f4bcaf6391222d7c41730a879b5dcde9a))
- add boro id column to operation table ([0b43b9e](https://github.com/bcgov/cas-registration/commit/0b43b9e1e890b8b89aa20f32f6d4d271625f6728))
- add custom header titles option to multistep form base ([d019151](https://github.com/bcgov/cas-registration/commit/d019151b48157bca4a9ed50d140934d5c7dd2359))
- add custom title to statutory declaration field ([c99c813](https://github.com/bcgov/cas-registration/commit/c99c81356a89d9fa9f065db46f07e43b1481ec5e))
- add get /user-operator-id api route ([36af1f9](https://github.com/bcgov/cas-registration/commit/36af1f93cd72027a6310be9c5e35fe97c2e734c7))
- add get env value action allow list ([0cec719](https://github.com/bcgov/cas-registration/commit/0cec7192a547a7659381b6d5f91311ebec6e1427))
- add multistep form edit button ([4caa438](https://github.com/bcgov/cas-registration/commit/4caa438f5464c80303c4d959c1f94a7dd3a05b16))
- add nextjs default envs for dev test and prod ([c906e04](https://github.com/bcgov/cas-registration/commit/c906e0428c1d8ba10fa30d976d05974b0cf5d4af))
- add operator column to operation table ([e2b887b](https://github.com/bcgov/cas-registration/commit/e2b887b24b810a64a2ae991b2027aca84a62a700))
- add placeholders for empty operations table fields ([62771ff](https://github.com/bcgov/cas-registration/commit/62771ffcb1a979ea4978fea07a68606f5e4700e7))
- add status pills to operation dashboard ([e5cce12](https://github.com/bcgov/cas-registration/commit/e5cce12152f18ca550bef9cfc7b8f7d6a942e21c))
- add statutory declarations disclaimer message ([353cc42](https://github.com/bcgov/cas-registration/commit/353cc425c9e09d42f6e35f363eed5301df218a26))
- add submission_date column to operations model ([2bb2fab](https://github.com/bcgov/cas-registration/commit/2bb2fabc616daa648d1d701ad67c956f06813c39))
- add support for multiline status in status pill ([805b3be](https://github.com/bcgov/cas-registration/commit/805b3befb9134c12574e716ef2973a56a75ac203))
- add user operator put api update routes ([3e2d88d](https://github.com/bcgov/cas-registration/commit/3e2d88dd34c1ab61ea3ba336920e599afe7da5f0))
- approve operator when granting boro id ([48fd96d](https://github.com/bcgov/cas-registration/commit/48fd96dec032c90a4e3cf40bd3c240a726c0960b))
- break instead of truncate long strings in datagrid ([7d7ff33](https://github.com/bcgov/cas-registration/commit/7d7ff33266835687f86822d77e8fb57f72b69bba))
- disable user operator multistep form if status is pending ([5499b66](https://github.com/bcgov/cas-registration/commit/5499b66798990768d2f1fa339c54c13eb40b7225))
- dynamicaly show operations table operator column based on role ([4b1bb77](https://github.com/bcgov/cas-registration/commit/4b1bb773e31e7dafd7a79608a5b9bef11b78dc0f))
- format submission_date in operations table ([d8451f9](https://github.com/bcgov/cas-registration/commit/d8451f9c36ebe9fd312ab28bb2d073c442e7f932))
- line break multistep header titles when more than 2 pages ([7ae9f6f](https://github.com/bcgov/cas-registration/commit/7ae9f6f78ac94d90c6adb1bda7105663565e5896))
- redirect to operator form depending on status ([78e4d05](https://github.com/bcgov/cas-registration/commit/78e4d056a0ec319f8cea19ed0972c7f8a3a3dea9))
- redo home page content ([c1054c5](https://github.com/bcgov/cas-registration/commit/c1054c5144869e7df33c2f95900c8afb0976d000))
- refactor and delete contacts of an operator if request rejected ([f080246](https://github.com/bcgov/cas-registration/commit/f0802469466dc7ebbcd78a70af5aff63e80441f8))
- remove operations table registration id column ([9796996](https://github.com/bcgov/cas-registration/commit/9796996ac6be3fead2e57c9d2c7cc6c96fca11f0))
- return operator name in operation out schema ([8a7f55d](https://github.com/bcgov/cas-registration/commit/8a7f55d1c52bb115b0159a7d850bb9643fda017b))
- statutory declarations is required ([5a29132](https://github.com/bcgov/cas-registration/commit/5a2913201f94a8fb40edb00ed07f47bd74984a83))
- style operations dashboard action button ([c979147](https://github.com/bcgov/cas-registration/commit/c979147517304b2a310042c2db69929467f2822a))
- throw error if custom title length does not match schema ([3e1821f](https://github.com/bcgov/cas-registration/commit/3e1821f267a3d5c160bdcfba5a8833bfc16902b5))
- update events json content ([9ab52bd](https://github.com/bcgov/cas-registration/commit/9ab52bd1d9bf475591085429a03d0c1ebce00e1f))
- update submission_date column on operation submit ([cbb2be5](https://github.com/bcgov/cas-registration/commit/cbb2be51ce353223fa96ed08ef2d8c60b04835cc))
- view multistep operator form depending on status ([bd92f41](https://github.com/bcgov/cas-registration/commit/bd92f41fb7dcef8197ccf4148b8f8112e14ce8c9))

## [0.1.1-beta-3](https://github.com/bcgov/cas-registration/compare/0.1.1-beta-2...0.1.1-beta-3) (2024-01-18)

### Bug Fixes

- adjust operator dashboard column widths ([963528b](https://github.com/bcgov/cas-registration/commit/963528b197ed978bccb35b89fed9efff7d90da8a))
- correct User Access Management tile permissions ([28af616](https://github.com/bcgov/cas-registration/commit/28af616dc35d854135a526008821223b91f16b1a))
- disable change request for prime admin request ([cc21801](https://github.com/bcgov/cas-registration/commit/cc218015603bd4a2e91726931da7ef876121e0d6))
- disable multistep form base submit button while submitting ([e0a7858](https://github.com/bcgov/cas-registration/commit/e0a78582414d1b617864bbecf86d28ee876a5328))
- disable user operator conact form submit button while submitting ([794af30](https://github.com/bcgov/cas-registration/commit/794af30278798e5c2c8a0ebbb3089d9b76c33a54))
- display & save correct user names ([ac9a411](https://github.com/bcgov/cas-registration/commit/ac9a41172b905c8ad138e9ebeb05648361db1b2e))
- duplicate variable names ([93cfd0c](https://github.com/bcgov/cas-registration/commit/93cfd0cac9234d4b77c80f0f05f71d93edf50307))
- handle form state externally to prevent data loss on error ([52e2c30](https://github.com/bcgov/cas-registration/commit/52e2c30aeb8485d5d1178580bf170f96b84cedfc))
- is_application_lead_external 'no' error ([b254ee8](https://github.com/bcgov/cas-registration/commit/b254ee8cb206ca9313d1926e46331f698c1958f8))
- logout- redirect self to keycloak logout ([70fd4b2](https://github.com/bcgov/cas-registration/commit/70fd4b282ff96dae288fb7a008f1d1419d480827))
- logout- redirect self to keycloak logout ([f969697](https://github.com/bcgov/cas-registration/commit/f9696973c8fea4bf85ebf8f5229313b953e8cbb5))
- logout- redirect self to keycloak logout ([40fa8ca](https://github.com/bcgov/cas-registration/commit/40fa8ca5b595507537ca752a31c7b7030d501138))
- operations status column width ([df2ccfc](https://github.com/bcgov/cas-registration/commit/df2ccfcda48b353d9282128754adc88c3f1fa693))
- operations table column width update ([9d4d2ba](https://github.com/bcgov/cas-registration/commit/9d4d2ba8ba399cd419818dacda739d5e1608b62a))
- prevent redirect on signout ([749f49f](https://github.com/bcgov/cas-registration/commit/749f49f509afb4ec66a92df0ff84624970994a3e))
- prevent redirect on signout ([2f14cf5](https://github.com/bcgov/cas-registration/commit/2f14cf571dacea493f16ec7fe50570e292aa7eec))
- save application lead data in database ([20fe802](https://github.com/bcgov/cas-registration/commit/20fe80218cd2e1e134ffa9543d801b1f4a0e8096))
- set external form state on submit ([57bf285](https://github.com/bcgov/cas-registration/commit/57bf285f4f58860927ca3a1e82e4d3876cbbf447))
- show cell border in mui datagrid ([cc35d83](https://github.com/bcgov/cas-registration/commit/cc35d836ab5898344945227c79a88beef821c967))
- transform application lead data for operations form ([4eca5b8](https://github.com/bcgov/cas-registration/commit/4eca5b8d69d16ba971fff8caf016446f7a624e0b))

### Features

- add change request status ([569dfca](https://github.com/bcgov/cas-registration/commit/569dfcab699c5c5176b076902238d31e4dd20ec4))
- add request change component ([21bc68e](https://github.com/bcgov/cas-registration/commit/21bc68e9af9c06eb6c755943a31d97db04eccd5c))
- add reset error prop to form base ([97dc590](https://github.com/bcgov/cas-registration/commit/97dc590c83bcd8feac114edfaf9160aceba666f5))
- add undo request change ([46e3a25](https://github.com/bcgov/cas-registration/commit/46e3a2527d3f49922ce4dabf22701cc629af25bd))
- change action style for operator dashboard ([79363ca](https://github.com/bcgov/cas-registration/commit/79363cad6a0cafd3472ff0672a637d6c43878c22))
- redo operations application lead form ([b7f8032](https://github.com/bcgov/cas-registration/commit/b7f8032f0c77424f26b4393ac2de1e032644ee06))
- style mui datagrid header ([0befd84](https://github.com/bcgov/cas-registration/commit/0befd84ac3787551fc4d12a51b5d318d3b13530b))
- style mui datagrid header icon ([224c90d](https://github.com/bcgov/cas-registration/commit/224c90dad0d87293cf53a8f070b23f4de0eefa85))
- update status enums ([5fe5c04](https://github.com/bcgov/cas-registration/commit/5fe5c040d21f04588b6912d780f208098a81b3c3))

## [0.1.1-beta-2](https://github.com/bcgov/cas-registration/compare/0.1.0-beta-1...0.1.1-beta-2) (2024-01-10)

### Bug Fixes

- add missing operations pages in idir routes ([3a5b7eb](https://github.com/bcgov/cas-registration/commit/3a5b7eb2e2a9def9b42b43b659c41f5013f6585a))
- add user_operator_status to type ([d890adc](https://github.com/bcgov/cas-registration/commit/d890adcb1477db273ac775edd4851d85451a3fcd))
- all user roles can navigate the multistep forms ([55f9c84](https://github.com/bcgov/cas-registration/commit/55f9c840523e16384afc4ad12156d2a90d02e06a))
- checkbox widget styling ([97eb150](https://github.com/bcgov/cas-registration/commit/97eb1507009ed5e5888d6cbbca96635b52f940ed))
- disable user operator form for cas admin ([ffa531e](https://github.com/bcgov/cas-registration/commit/ffa531e94205126f3543fc3f4276945c9ceeb82a))
- idir names entered into the db incorrectly ([1a09cf8](https://github.com/bcgov/cas-registration/commit/1a09cf8d533c706ec60e9c82ef9baba3ac290b90))
- make revalidate path argument optional ([4696831](https://github.com/bcgov/cas-registration/commit/4696831ae0f6ffaf740f2a384152d56ff1b11649))
- multistep form disabled next button ([601cb6a](https://github.com/bcgov/cas-registration/commit/601cb6a54116f45a2646566813217cc36454412e))
- multistep form url ([4b0a942](https://github.com/bcgov/cas-registration/commit/4b0a942ad45ceef45523ea90ecfa5909e83fe9bc))
- multistep form url ([cf30576](https://github.com/bcgov/cas-registration/commit/cf30576220229b4af86b692f002bc57600f861fd))
- no user operator id error ([362feb6](https://github.com/bcgov/cas-registration/commit/362feb6aed82b859f342833f9b9a6ee23ed57eef))
- no user operator id error ([6cd7fc5](https://github.com/bcgov/cas-registration/commit/6cd7fc56bc990f64488b930b5e7e8f2912c0990b))
- null user operator id ([cdd0dc9](https://github.com/bcgov/cas-registration/commit/cdd0dc9e605a62026f7c86cc1aad506cf523efd1))
- operator search dropdown open logic ([4f3f420](https://github.com/bcgov/cas-registration/commit/4f3f420652d242368f862711c68192722baf948f))
- oversized submit buttons ([555a5be](https://github.com/bcgov/cas-registration/commit/555a5be8e273c21a75d4b8605a7b7f592008a896))
- refactor `UserOperatorMultiStepForm` component and fix the issue ([05d0fa3](https://github.com/bcgov/cas-registration/commit/05d0fa350866cbfa2abfb50a0038d2687c67e43a))
- remove code that prevented user to the 3rd flow of admin request ([293af70](https://github.com/bcgov/cas-registration/commit/293af7074dc4d0fd9cae7659b239a35d4e1d44a8))
- remove margin from submit button ([6c96515](https://github.com/bcgov/cas-registration/commit/6c96515fbfac708fd9d57c0296da19d998f46ad3))
- remove partial types ([1af14c6](https://github.com/bcgov/cas-registration/commit/1af14c6af1c6f849aded2b8ddb82a3486c5f1050))
- restrict operations review to cas internal ([4491bcc](https://github.com/bcgov/cas-registration/commit/4491bcc46a46998a77ec9dedda591153330e3415))
- search dropdown on error ([6e504dc](https://github.com/bcgov/cas-registration/commit/6e504dc840b757d830eb52326c63cb4f8469be66))
- stop end point call if no data in operator search ([30b3ac6](https://github.com/bcgov/cas-registration/commit/30b3ac6fcfd5ceae9c6e416443f9842303a5a9ad))
- use glob pattern to reach nested fixtures ([9da892f](https://github.com/bcgov/cas-registration/commit/9da892feba4634b2deb8fbc46d17b8063a3c7619))
- use phone widget in user profile form ([1e4090b](https://github.com/bcgov/cas-registration/commit/1e4090bf8a518bff3c574b5a61cb5efc7f04ddc2))
- user fixtures broken phone numbers ([59956f4](https://github.com/bcgov/cas-registration/commit/59956f427e815345ac5fbefb646411d47d987197))
- user operator form data ([fc67d7e](https://github.com/bcgov/cas-registration/commit/fc67d7e97424820270aa1aed48d25e72f3d75a14))
- user operator form data ([cf6cb70](https://github.com/bcgov/cas-registration/commit/cf6cb70a789bb4aef3957365d612486a87c4f54f))
- user operator form data ([8f0ddbd](https://github.com/bcgov/cas-registration/commit/8f0ddbdc0e4d8ff44e94f455015c0a999564466b))
- user operator form regression ([f871e7c](https://github.com/bcgov/cas-registration/commit/f871e7cba37f3ca37e5572b76126f98615f26850))
- user operator multistep form display logic ([0a53b0f](https://github.com/bcgov/cas-registration/commit/0a53b0f2bb548da720098191cfcb29647ec31193))
- user operator review success/error display ([b0fc26e](https://github.com/bcgov/cas-registration/commit/b0fc26e9a1fa9f4f95aa144657345eaa438a9872))
- user operator status model ([7b5aadd](https://github.com/bcgov/cas-registration/commit/7b5aadde649be07054748e7dd624a3c3d89e5530))
- UserOperatorReview.tsx ([0430ff7](https://github.com/bcgov/cas-registration/commit/0430ff79fb05ffe2e86da3e67f2b539b32661d98))
- useSession missing props ([5abce6b](https://github.com/bcgov/cas-registration/commit/5abce6b7b8150f9fe67b2c691b5c83539eb1cac4))

### Features

- add audit columns - first draft ([7e0b8fe](https://github.com/bcgov/cas-registration/commit/7e0b8fe937940c82e0f2f97313459769a7c96b8e))
- add audit columns - first draft ([a4faa15](https://github.com/bcgov/cas-registration/commit/a4faa158abf57cf03ea8b935c563306c46af977a))
- add auth protection to all endpoints ([290a5f9](https://github.com/bcgov/cas-registration/commit/290a5f981b1c7578c5d1a751faeaa71c665fa2d5))
- add checkbox widget ([9194f27](https://github.com/bcgov/cas-registration/commit/9194f27cde30adfa8932a12eeee5a73f0b747f91))
- add operator legal_name api search route ([3d35c71](https://github.com/bcgov/cas-registration/commit/3d35c71ed4ac8b13b3b26bb33d4c75b3e9520cee))
- add operator search widget ([315ba3a](https://github.com/bcgov/cas-registration/commit/315ba3ad7cfc9577bd58c2a21b88268ead0fec04))
- add`BcObpsRegulatedOperation` model ([8e687bf](https://github.com/bcgov/cas-registration/commit/8e687bf6ddf1324c79e62d10d83a478f58b8b592))
- cas users can approve/deny operator and users separately ([b73daf3](https://github.com/bcgov/cas-registration/commit/b73daf3618192ed3256ff41d629d7e32c31d6931))
- disable submit if cas admin ([ce5cf7d](https://github.com/bcgov/cas-registration/commit/ce5cf7d98cfc305844b0b03cb0cd8487fe7cdcd7))
- set clear on blur to false in operator search widget ([26d763e](https://github.com/bcgov/cas-registration/commit/26d763e4e2ce470185262b1f6f5a2fe6ac51a682))
- update field template with submit buttons error handling ([cf2a21c](https://github.com/bcgov/cas-registration/commit/cf2a21cd5affb0784a1ae10d75cf19d9d5b1d7cb))
- update mui no options text and dropdown handling ([3145226](https://github.com/bcgov/cas-registration/commit/3145226fcf25a7df1629b3dbedcaf9a3ece6e3ce))
- update select operator form schema ([badf3c0](https://github.com/bcgov/cas-registration/commit/badf3c03b5cae79374787e35b1483221b926da14))

# [0.1.0-beta-1](https://github.com/bcgov/cas-registration/compare/0.1.0-alpha-1...0.1.0-beta-1) (2023-12-15)

### Bug Fixes

- add credentials secret to one-liner and name variable consistently ([bee9a23](https://github.com/bcgov/cas-registration/commit/bee9a2349a47b22ff7e6e19aecfe03b54d4a3a96))
- add default country to phone widget ([717e19f](https://github.com/bcgov/cas-registration/commit/717e19f90dfde3e089aa757838c56d24611784d1))
- add disabled props to custom widgets ([ea5e951](https://github.com/bcgov/cas-registration/commit/ea5e9511a6c0b516d8cef5572d5820a28e640d96))
- add file widget disabled colour ([2a5f7be](https://github.com/bcgov/cas-registration/commit/2a5f7be4d4b109840322053cb895ea7b2dc7bcb2))
- add header icon link and minor style improvements ([13824ea](https://github.com/bcgov/cas-registration/commit/13824eaac42ae61a730a6a385daae98b424d4944))
- add min width to multstep header circles ([a63d00d](https://github.com/bcgov/cas-registration/commit/a63d00d1a1f4846fc6ef699ac1f4e8fb04c9ac93))
- add multistep support to operations edit ([51b1df5](https://github.com/bcgov/cas-registration/commit/51b1df5f82354436fb638bc82a9dd92cc043600c))
- add name to file and text widget input ([190d380](https://github.com/bcgov/cas-registration/commit/190d380e5cbccf7a99f6aa6a2110ae1ab4fb9548))
- add phone format to so_phone_number field ([d496266](https://github.com/bcgov/cas-registration/commit/d496266db3b17a36326725788d1a6ba4a3e980f8))
- add readonly/disabled state to custom widgets ([c1fec7a](https://github.com/bcgov/cas-registration/commit/c1fec7afe29a6db70a1d3e15401b2010e6b9f2eb))
- adjust main div padding ([247c0d0](https://github.com/bcgov/cas-registration/commit/247c0d05924fdc2b87dc20960e09d4cb647e812f))
- adjust main div padding ([1655919](https://github.com/bcgov/cas-registration/commit/16559197f089b03aff1269b46928109bd787c7dd))
- alert icon shrink ([9336043](https://github.com/bcgov/cas-registration/commit/9336043e775c35bd5cee756639e355c19f7f309c))
- application lead ui widget ([e6a53fe](https://github.com/bcgov/cas-registration/commit/e6a53fec8dd8b521ddc1fed553954109d6230fee))
- array field template ([d0ed2dd](https://github.com/bcgov/cas-registration/commit/d0ed2dd54fbaa7f9ffbb6435f69d86c77178028d))
- assign verrified_by by ID rather than object ([a93271b](https://github.com/bcgov/cas-registration/commit/a93271be0b32522285721bcdaf5abd23e393af5b))
- backend tests failing due to fixture error ([89e997c](https://github.com/bcgov/cas-registration/commit/89e997c409faa3bf7fc11ff24fb3c8fae3a24a77))
- bceid idp hint ([cf41618](https://github.com/bcgov/cas-registration/commit/cf41618548d335cabecdbf9202a20ee913805b89))
- breadcrumbs hidden due to navidation updates ([7c50c5d](https://github.com/bcgov/cas-registration/commit/7c50c5d0cefd4d889ef8c033696aa5a4a0ae1a9f))
- breadcrumbs hidden due to navidation updates ([df13a99](https://github.com/bcgov/cas-registration/commit/df13a9928bd3fa722e56c8af32135a46358cee36))
- breadcrumbs responsive height ([ad61ced](https://github.com/bcgov/cas-registration/commit/ad61ced8d78f82efa9f3099595c8a6003ee8bd83))
- business_structure field is foreign key ([25fd259](https://github.com/bcgov/cas-registration/commit/25fd2599f24406a7dd91d6e3b99938e350b661f5))
- change backend config property to match job manifest ([2e48692](https://github.com/bcgov/cas-registration/commit/2e48692f44620da3b589d3158adcc4edfb0e3d25))
- change name to what Postgres expects ([ae66cc5](https://github.com/bcgov/cas-registration/commit/ae66cc56094f17467897eb1207fdf29d8f1f9228))
- change string to enum in test ([fe1789e](https://github.com/bcgov/cas-registration/commit/fe1789ee27d6b37b5f26cd937391bc5cbe875128))
- code review updates ([e3526fe](https://github.com/bcgov/cas-registration/commit/e3526fe4d9290e23be56af34a3dde99047babfc6))
- combobox and multiselect disabled state ([be78aff](https://github.com/bcgov/cas-registration/commit/be78affca23707314231ebc9007c3b6143569473))
- combobox enum error ([6965bb5](https://github.com/bcgov/cas-registration/commit/6965bb5b0338ca30ccb02303a872768d8dfa70d9))
- correct output to remove duplicate protocol prefix ([6ece32a](https://github.com/bcgov/cas-registration/commit/6ece32a8654e9bc30f686b98a8567f343fda4ecb))
- correct route for operations table for bceid users ([a085fd6](https://github.com/bcgov/cas-registration/commit/a085fd6de700ab349f4ef929e022b5aaed070c06))
- database binding member not correctly addressed ([5c5c73f](https://github.com/bcgov/cas-registration/commit/5c5c73fd0b1110b13bfc31193fd45af3d0600863))
- directory should be written as directory 😵 ([f5d8aae](https://github.com/bcgov/cas-registration/commit/f5d8aae60c3552bf74eb4e874173dd6f9c2d0c33))
- duplicate keys in operations ui schema ([1954749](https://github.com/bcgov/cas-registration/commit/1954749524746459b07f8e6d3fabc07091f3be40))
- enums architecture ([bcba247](https://github.com/bcgov/cas-registration/commit/bcba2474054aaa01fac0be663c7268b94fce7fea))
- field template required regression ([57b1d29](https://github.com/bcgov/cas-registration/commit/57b1d296269d0e7c158276b39f31ff2c69b297b0))
- filter by operation id ([41ab6c8](https://github.com/bcgov/cas-registration/commit/41ab6c8c4045a0970c48e5e87d0c5cb6653b1135))
- fixup add email and user_id to fetch and interface ([3c4b954](https://github.com/bcgov/cas-registration/commit/3c4b954d928cc5f5892b32405fc46f748a129599))
- fixup the fix ([17709f0](https://github.com/bcgov/cas-registration/commit/17709f00fc029698d984f790cb03112e07e07c35))
- footer alignment ([449c91b](https://github.com/bcgov/cas-registration/commit/449c91ba6747cb5099dacbc2d4ea612360ca56b6))
- formdata missing id field ([a98c10b](https://github.com/bcgov/cas-registration/commit/a98c10b7eebde841231c6c2e22dafe1329bf2683))
- give pod more memory for terraform execution ([e4ea74d](https://github.com/bcgov/cas-registration/commit/e4ea74d7dd04ace4abb7ad8ac99114200d12dc0d))
- handle api errors in `actionHandler` function ([b4b882d](https://github.com/bcgov/cas-registration/commit/b4b882df49d45685f237c5cb427c640908535632))
- header colour ([ecde25b](https://github.com/bcgov/cas-registration/commit/ecde25bf4e22291a20bd96c5cd1ec684708a74f0))
- header colour regression from mui theme update ([8395816](https://github.com/bcgov/cas-registration/commit/83958160ac93574025b643ec8adb5b125a6d85e6))
- header merge spacing ([1d91d6e](https://github.com/bcgov/cas-registration/commit/1d91d6e01fc8048cd03904924bb79742ef582203))
- is label rebase issue ([a3ca151](https://github.com/bcgov/cas-registration/commit/a3ca151ba9cbb782052590803f0acc4e2db64868))
- make multiple_operator business_structure field a foreign key ([b44dd15](https://github.com/bcgov/cas-registration/commit/b44dd15f28644cc4c03da74cec19c5b054a17ce5))
- make ui:hidden work correctly with inline field template ([38de8f5](https://github.com/bcgov/cas-registration/commit/38de8f574f39be9c073e9b98a2fe19f67d68ca82))
- misleading operation db comment ([c33a8f0](https://github.com/bcgov/cas-registration/commit/c33a8f0954360b098e9db0a5b196ae1e0e4a0789))
- move mulistep buttons to formbase children ([4474432](https://github.com/bcgov/cas-registration/commit/447443201259d230544c80b0b9ae2818fbba831f))
- move terraform cache to base dir ([39980a6](https://github.com/bcgov/cas-registration/commit/39980a66a089aa65a22bd5504eca90b98fffc108))
- move tf init to pod manifest ([a421afe](https://github.com/bcgov/cas-registration/commit/a421afe650e904cd79dad9382664d2b2682a6609))
- mui autocomplete key spread nextjs error ([a9f1e42](https://github.com/bcgov/cas-registration/commit/a9f1e42b315f9e72a4966d07ba50a39210dc9f6a))
- multiple operators default none ([d37b216](https://github.com/bcgov/cas-registration/commit/d37b21680402e831d9d654c9c5d994e783e1fc66))
- multiple operators empty array bug ([3c569f5](https://github.com/bcgov/cas-registration/commit/3c569f58c62c7b32b935c8ddb4b88db72a899c03))
- multiple_operators_array field null bug ([0202d1d](https://github.com/bcgov/cas-registration/commit/0202d1d87815b34004ec867c8429bfd455d6d3ba))
- multiselect show correct saved values ([b9e4b0b](https://github.com/bcgov/cas-registration/commit/b9e4b0b7901d0ab74d9221d83cdb6d8e21db1f0d))
- multistep form header responsive mobile view ([677c806](https://github.com/bcgov/cas-registration/commit/677c8066ce3971f8077a2ae9f11c0d1236c9221c))
- operation put api save ([3d69ab2](https://github.com/bcgov/cas-registration/commit/3d69ab289c93e22c781145c3e123959065ed6c77))
- operation schema circular import error ([ecb85a5](https://github.com/bcgov/cas-registration/commit/ecb85a50996e485d592a3b5c11504e21847dea8e))
- pass form section titles to multistep header ([29b398c](https://github.com/bcgov/cas-registration/commit/29b398c5a4df7ab176dd40a1797b658a59b3e288))
- percentage ownership column max ([46cabfc](https://github.com/bcgov/cas-registration/commit/46cabfca638cc9a1cf4e8d6d8cbc2868fbaf21ba))
- province dropdowns not populating values ([d60fcef](https://github.com/bcgov/cas-registration/commit/d60fcef806771e99c0a17ad564fee1b534dac820))
- rebase breakage ([a65bca6](https://github.com/bcgov/cas-registration/commit/a65bca65aac4b8c9e2b8f49449e73567dc8ee3ac))
- remove empty field label from dom ([9023958](https://github.com/bcgov/cas-registration/commit/9023958d176901abc040528fc859ecc2599b077c))
- remove redundant breaks ([b5b2a9e](https://github.com/bcgov/cas-registration/commit/b5b2a9e6db56479605946f4f1a1105677a37f32c))
- remove redundant function and use getToken() ([446da02](https://github.com/bcgov/cas-registration/commit/446da0283b9f438b5bc42e788e3d097edbd809a8))
- remove selected options ([82da050](https://github.com/bcgov/cas-registration/commit/82da050f975ff870ae981e543ba520f7436f8f3e))
- rename functions named 'error' ([cc1c182](https://github.com/bcgov/cas-registration/commit/cc1c18289d26fbffa37786451c6c3f35a53402dd))
- return empty string for optional fields ([5053b73](https://github.com/bcgov/cas-registration/commit/5053b73e64d96317e47b14e669840f2b2836011b))
- review component success/error alert disappears ([5a8b790](https://github.com/bcgov/cas-registration/commit/5a8b79024bcb0a514f0be3c50c6dea5a6e43c3d3))
- save is_mailing_address for multiple operators ([983bb60](https://github.com/bcgov/cas-registration/commit/983bb601194360250a7f2ed063c226b8affe76bf))
- save operation has multiple operators question ([67033f3](https://github.com/bcgov/cas-registration/commit/67033f3260ec68e3918b95ef03fee0d47fd44b77))
- select widget label handling ([1e482e6](https://github.com/bcgov/cas-registration/commit/1e482e6baf25a2eb58a017e9f89720cdfce2e4e0))
- select widget placeholder showing when value selected ([a6162b3](https://github.com/bcgov/cas-registration/commit/a6162b37a53087dbd2999afb8a507a8c3c283776))
- set TF version to match package manager's latest version ([0aef18b](https://github.com/bcgov/cas-registration/commit/0aef18b05087b1f0c8334a957217e2a18a750bf5))
- show naics code instead of id ([fb36adf](https://github.com/bcgov/cas-registration/commit/fb36adf3b6863530b4b59f6c1dad538feec90c8e))
- smells ([8613680](https://github.com/bcgov/cas-registration/commit/8613680f8d479e399798825bcc557d5bdbe72632))
- test failing due to api change ([4523668](https://github.com/bcgov/cas-registration/commit/4523668c9080f6f48fa59fee69e65d47b7286d96))
- update initial migration file and remove redundant ones ([f000e5c](https://github.com/bcgov/cas-registration/commit/f000e5c43deb4cab4d4f0e8b3639a4f30c01d41d))
- update interface for DataGrid where context isn't required ([51241f2](https://github.com/bcgov/cas-registration/commit/51241f2b218a70cda582bb736936b3e397e0d75a))
- update job command to avoid confusion ([2f87e21](https://github.com/bcgov/cas-registration/commit/2f87e2180fc84f42a01ba44e03cd53ce1ce4cb04))
- update operations form idir protected routes ([bc23231](https://github.com/bcgov/cas-registration/commit/bc232318437f65c46f6f4559f1a41719107b6cc1))
- update routes for test deployment ([fc53220](https://github.com/bcgov/cas-registration/commit/fc53220aae5845bd1b566245a60a96c12fd0c83d))
- update service account display name to match expected ([89882d5](https://github.com/bcgov/cas-registration/commit/89882d5633b3d6849fdb5340d8d1029e73d0f6be))
- use 0 for create operator query param instead of string ([2de2304](https://github.com/bcgov/cas-registration/commit/2de2304edbf62075a67da1b415ac4a8739251e46))
- use chip for styling of status ([95dfcee](https://github.com/bcgov/cas-registration/commit/95dfcee4cac5f62f70e94548e67265543091cab2))
- use correct attribute for api fetch ([8f81ed8](https://github.com/bcgov/cas-registration/commit/8f81ed813c99b89099bc4a363057c3c5293fb900))
- use correct command ([4f12773](https://github.com/bcgov/cas-registration/commit/4f127737bb30e13f10abb5b4e6c1e6006c021b9f))
- use correct context ([f6cc262](https://github.com/bcgov/cas-registration/commit/f6cc2620e02a69305d8daaf5f8800aa28169dd70))
- use phone widget in application lead section ([af48103](https://github.com/bcgov/cas-registration/commit/af481037d97f2c07b98c39a6801a73a215f36183))
- user operator form response id ([c3365b7](https://github.com/bcgov/cas-registration/commit/c3365b75d184a9605153d62203df17c8064d0863))
- user operator province ([db08e78](https://github.com/bcgov/cas-registration/commit/db08e78c9fafe232075632655d772222b5d67fa0))
- user operator select page styling ([d1d5655](https://github.com/bcgov/cas-registration/commit/d1d5655a836a2f189b95b95041d1110ab3604079))
- user operator senior officer error ([222604f](https://github.com/bcgov/cas-registration/commit/222604f767649c3bfcb09768c9a813776c3cf4fe))
- user operator title ([9ced11d](https://github.com/bcgov/cas-registration/commit/9ced11d3c28faad96f197a74aeba7b1d04513bbf))

### Features

- add `FieldTemplateWithSubmitButton` component ([b8f830e](https://github.com/bcgov/cas-registration/commit/b8f830e060ed5bac657b8437036a1065088ee240))
- add a temp route to fetch user info ([b739723](https://github.com/bcgov/cas-registration/commit/b7397237c88ba50fca04aa789a3d80141fe39d2c))
- add action button to put status change to api ([5afca49](https://github.com/bcgov/cas-registration/commit/5afca491261df779b11aeac3587f2d805959204d))
- add api route for all UserOperators of an Operator ([0b76a13](https://github.com/bcgov/cas-registration/commit/0b76a13d6ed0dcf519853a576cda5cabbcb714f4))
- add api route for updating status of UO ([31f1368](https://github.com/bcgov/cas-registration/commit/31f13683cd7a4d67ff8231423569b94d79277277))
- add basic custom text and select widgets ([5189d42](https://github.com/bcgov/cas-registration/commit/5189d42ba06094a2b5ab3d5e817529402d8e9acd))
- add business_structure data model ([e09090c](https://github.com/bcgov/cas-registration/commit/e09090c65961fc4b6c35ebc40219e1cf5b229546))
- add canadian postal code validator ([b9b3f92](https://github.com/bcgov/cas-registration/commit/b9b3f92f120cc338d99b7adb2e3fbec1c868bc6f))
- add current user's id to verified by on status change ([7eebfef](https://github.com/bcgov/cas-registration/commit/7eebfef68e4585d30a555211e6adf07eebc5b313))
- add custom file widget ([7a4b3f6](https://github.com/bcgov/cas-registration/commit/7a4b3f6158662f6864fb480d3d5ef66346607b17))
- add custom form array add button label ([8bcb753](https://github.com/bcgov/cas-registration/commit/8bcb753040fe3edeaaf449f2fd652e8b93c8b34b))
- add custom mui widgets to rjsf form ([0f22358](https://github.com/bcgov/cas-registration/commit/0f2235843f12181facd76baa4aebb29b55d03f07))
- add custom titles to user operator form ([6828090](https://github.com/bcgov/cas-registration/commit/68280909d071609833470bdce62e75f93eb3cd2a))
- add data fetch and pre-formatted display to user's page ([1b928a4](https://github.com/bcgov/cas-registration/commit/1b928a4361a2d341ecf79e29c6f007b8cf4d0879))
- add dismiss button to review alert ([be03c79](https://github.com/bcgov/cas-registration/commit/be03c799174de6d656a30928f93689ec3cdfe71e))
- add email and url widgets ([e0fb6d1](https://github.com/bcgov/cas-registration/commit/e0fb6d18e3c7541694cafeb5c20782f311dde145))
- add endpoint to handle new operator and user-operator request ([4af7778](https://github.com/bcgov/cas-registration/commit/4af77785c240fc50e3111fad6878eb7caefbd229))
- add endpoints to create operator for prime admin request ([6f5cf95](https://github.com/bcgov/cas-registration/commit/6f5cf95908ce40114a98211665a5c1ebb05d5513))
- add error boundary component ([82782bb](https://github.com/bcgov/cas-registration/commit/82782bbea395231d8afbb3a06625ebe1f1eaf202))
- add error state to inline field template ([f0330c3](https://github.com/bcgov/cas-registration/commit/f0330c36acfee8b036257e2abf8f47a8e9c10e60))
- add formats to email and url fields ([c35bb78](https://github.com/bcgov/cas-registration/commit/c35bb78bbe66d911e4f2aac247862285bbb1df8a))
- add generic mui modal ([f55b23e](https://github.com/bcgov/cas-registration/commit/f55b23e6ab7b3d4461e639a6bdd8f06311cc60fb))
- add max number 100 for percentage fields ([912a085](https://github.com/bcgov/cas-registration/commit/912a085340f8a5f32fa64d5c913f1744e3945edb))
- add max number to number fields ([ff3f2c0](https://github.com/bcgov/cas-registration/commit/ff3f2c0089c76ff422ce25edcc5172f781a88f49))
- add mui component styles to theme ([2918857](https://github.com/bcgov/cas-registration/commit/29188571ea426ddd54282f4b451238f6b32b3d3c))
- add multiple operators schema ([115cf5c](https://github.com/bcgov/cas-registration/commit/115cf5c4596efe685f32ce2a06b7b9810f10a723))
- add multiple_operator model and schema ([45ae21b](https://github.com/bcgov/cas-registration/commit/45ae21b1c501fa410088ad6e3701ed69366fed73))
- add multiselect widget ([1478e28](https://github.com/bcgov/cas-registration/commit/1478e286ca9fc563ea340e4e46dd2f38a9c03d34))
- add multistep header ([5d78acb](https://github.com/bcgov/cas-registration/commit/5d78acb5bdc0b146ef2656d38d87047bc93a846c))
- add operations form business type widget ([58a4832](https://github.com/bcgov/cas-registration/commit/58a4832d321d15bb095771b9430f47f0867814cc))
- add phone field validation ([e9cc9a2](https://github.com/bcgov/cas-registration/commit/e9cc9a27eb5a50296a9a4b7c3b31f32e7fc19c78))
- add postal code widget ([ad1b55c](https://github.com/bcgov/cas-registration/commit/ad1b55cdc432ba326ae16e26f866068557e61a09))
- add required fields to multiple operators form ([a72799b](https://github.com/bcgov/cas-registration/commit/a72799b4c087701749e37f343760473e76ae1ec6))
- add review component confirmation modal ([24f904f](https://github.com/bcgov/cas-registration/commit/24f904f1be5e6779bc124483de03ca089d22e61f))
- add rjsf phone widget ([bf4d070](https://github.com/bcgov/cas-registration/commit/bf4d0709ea1d0895d420cc9d30fd3620cbbb33c2))
- add status change column logic to user dataGrid ([5ed0eb4](https://github.com/bcgov/cas-registration/commit/5ed0eb4cf2e5caface9dcfdb76eb1c859cfa9b32))
- add tailwind global link colour override ([410877e](https://github.com/bcgov/cas-registration/commit/410877efbcaabb893b700584731a0a45871d16d1))
- add user operator id to Create Operation ([730233f](https://github.com/bcgov/cas-registration/commit/730233f165b2234888f79a36a6d16c17cebf375e))
- add widget error states ([425f485](https://github.com/bcgov/cas-registration/commit/425f485397c11d252dd11b99b02042a28570787c))
- center main content to align with header and footer ([645d810](https://github.com/bcgov/cas-registration/commit/645d810937b1279d598ab51b1c3dbaace5e9a9bb))
- change default operation status and add submit argument ([294ccce](https://github.com/bcgov/cas-registration/commit/294ccce0d5f5c5f82209fcba21fc930be8f0ccbd))
- create multi step button component ([40de665](https://github.com/bcgov/cas-registration/commit/40de6653a2595a46bad076179c168b4091ed2306))
- display error message in inline field template ([f43271e](https://github.com/bcgov/cas-registration/commit/f43271e65755dd4cb548b6d7bbe78d4b319f563d))
- fetch all UserOperators waiting for status from Operators of Admin ([25eaae6](https://github.com/bcgov/cas-registration/commit/25eaae655bba52c19d750afe215dce8abd691309))
- fetch business structure data and pass to operations schema ([bc10d3a](https://github.com/bcgov/cas-registration/commit/bc10d3a59617e27a5a77956d4c855c2cb5d41fc8))
- filter out user's own id from dataGrid ([d1aef31](https://github.com/bcgov/cas-registration/commit/d1aef3157644aaa914bbdf3e6f3ced3b5987648f))
- force calling code on phone widget ([03a22e3](https://github.com/bcgov/cas-registration/commit/03a22e3cd519c0986542f59f1ccd48bc0d28aa2c))
- format fetch into DataGrid ([1f7e629](https://github.com/bcgov/cas-registration/commit/1f7e6290d2fa30cd0c7ac74d354f1b704f8af672))
- improve form responsive layout ([0bd8830](https://github.com/bcgov/cas-registration/commit/0bd8830e0f36520b1350d662bc4e3ce64f976bf0))
- make `UserOperatorForm` a multi-step form ([00974cb](https://github.com/bcgov/cas-registration/commit/00974cb0d39fc00a4dfa85ec7c7974cf104397b4))
- mo_business_structure field is required ([d662493](https://github.com/bcgov/cas-registration/commit/d662493ce823b21c7b396b20aa9cbc173b89db2a))
- New User Form & Endpoints ([fc4e248](https://github.com/bcgov/cas-registration/commit/fc4e24856dc63a37e6434bff8c0d1d4771f5c8b5))
- remove number input arrows globally ([23cf257](https://github.com/bcgov/cas-registration/commit/23cf2576abfd5b28fe8d65c415a9adc6f8022817))
- remove use client ([4c1b8a0](https://github.com/bcgov/cas-registration/commit/4c1b8a01d5a6ce36a0543be0a8c4747e39b3e1a8))
- return operation row id from create_operation ([90b7c8d](https://github.com/bcgov/cas-registration/commit/90b7c8d4959dc6a5e507552a917ca3eb4857e48e))
- rjsf set number input based on field type ([fa14391](https://github.com/bcgov/cas-registration/commit/fa14391cacd174f70ca8d220a21d92ef1902d074))
- rjsf transform error messages ([a4c8746](https://github.com/bcgov/cas-registration/commit/a4c87468e5c4c5e6b8c36d8f45d2534da77b2e90))
- role protected app routes ([c3633bf](https://github.com/bcgov/cas-registration/commit/c3633bf83e903d56370eb882dbfd5154e3e6d589))
- save has_multiple_operators ([a86609d](https://github.com/bcgov/cas-registration/commit/a86609d11fdde09da3359a87e37da635157a5b45))
- save multiple operator is mailing address ([f3279a9](https://github.com/bcgov/cas-registration/commit/f3279a97ee0d9fb757343678666481ac0b8abda0))
- save multiple operators array data ([124a874](https://github.com/bcgov/cas-registration/commit/124a87446078c29f5fa5cf627d5df29e0dd7aa7e))
- set max page width and center header and footer ([287f553](https://github.com/bcgov/cas-registration/commit/287f5538cf70dc4fc17bc0bdcf5b2927714595f4))
- set max page width and center header and footer ([f43c9af](https://github.com/bcgov/cas-registration/commit/f43c9af3814ab3cf636a139ed2cbef20758a3917))
- style multiple operators form section ([08e2b9b](https://github.com/bcgov/cas-registration/commit/08e2b9bd946dc75da9f06ca78c3fc62af2e23faa))
- style operations submission page ([3fc8cda](https://github.com/bcgov/cas-registration/commit/3fc8cda8a43c19b9584f53a3dab6fe7dba154621))
- subsequent user can request access to operator ([741064b](https://github.com/bcgov/cas-registration/commit/741064b58c6cdd3b43387bbe973421bed6f6abfd))
- update prime admin request access flow based on the design ([d065c62](https://github.com/bcgov/cas-registration/commit/d065c62878de3b8ffd942f221bfbea74241f13e0))
- update select operator page and form ([7687f86](https://github.com/bcgov/cas-registration/commit/7687f86b190683700615525e41b870433216dcca))
- user can add application lead ([ca468d2](https://github.com/bcgov/cas-registration/commit/ca468d2d5a7acebe5c5594fc34c9722d3cc1e9c8))

### Reverts

- Revert "chore: intentionally breaking check migrations in CI" ([5524c87](https://github.com/bcgov/cas-registration/commit/5524c877bc697ead650a3caa378017877f6707de))

# 0.1.0-alpha-1 (2023-11-09)

### Bug Fixes

- convert jest.config to mjs for NextJS ([eb67a5e](https://github.com/bcgov/cas-registration/commit/eb67a5e9ba9c49f9eb61ef0b776f28e4057af799))
- fixup add missing fields to User model ([8aa3074](https://github.com/bcgov/cas-registration/commit/8aa30744ee16c9ca5e62513f76afe292fc8e1148))
- move instance modification into setup ([0db361c](https://github.com/bcgov/cas-registration/commit/0db361cfc6bbb9afb08fc594caf8786d78e076c6))
- update field name to match migrated field ([5648305](https://github.com/bcgov/cas-registration/commit/5648305eb08fd8b6f31fe2a7d5bc479c7ee71887))

### Features

- add API endpoints for prime admin to request access ([622f51a](https://github.com/bcgov/cas-registration/commit/622f51a67b9fc9d573535a3e901c3b69712fec4a))
- add initial codeql workflow ([8b84b30](https://github.com/bcgov/cas-registration/commit/8b84b30d4a41ab7f780b93ef45573f476d275d71))
- add playwright tests to CI ([1384021](https://github.com/bcgov/cas-registration/commit/138402114db08487c89ffc4478e8c2b0faca1040))
- add select operator and access request API endpoints ([4fb1a1a](https://github.com/bcgov/cas-registration/commit/4fb1a1a378b79e4a0d42306f94ec6e83b0c99e23))
- add select operator and access request pages ([3b8c877](https://github.com/bcgov/cas-registration/commit/3b8c8778b40e8b7d2b2ec28dc0b8a9f15f10e5b3))
- add user-operator request access form ([080360a](https://github.com/bcgov/cas-registration/commit/080360a98ce0db7b3858852ffef1036e755000d1))
- added initial build push workflow ([2c0ffb6](https://github.com/bcgov/cas-registration/commit/2c0ffb64e09f511c11657363c325538b6a40c09a))
- added initial owasp scan workflow ([1a7ba6d](https://github.com/bcgov/cas-registration/commit/1a7ba6de56f2842356fd9aa303e0cb3991740277))
- added initial pre-commit workflow ([152d598](https://github.com/bcgov/cas-registration/commit/152d598fb2911719d627304a483893de1d245859))
- added initial sonarcloud workflow ([587d7cb](https://github.com/bcgov/cas-registration/commit/587d7cb7e6a7d00832b9e404b5e8916f22d5b822))
- added initial test.yaml file ([4ac8785](https://github.com/bcgov/cas-registration/commit/4ac8785ce97ca9528d3e77fa4fff97357e8058c7))
- added initial trivy container workflow ([4358b15](https://github.com/bcgov/cas-registration/commit/4358b15b2b1699d9952d9f69dc0b07df7ff59701))
- added initial trivy repo workflow ([1f5bc12](https://github.com/bcgov/cas-registration/commit/1f5bc12df7502990d3ad382f40c6a7576aa899f1))
- added pre-commit config file ([05c4c15](https://github.com/bcgov/cas-registration/commit/05c4c155d36c4e885fff0380e06f9ca28b2544f4))
- adding local-app-run action.yml ([8ee6e03](https://github.com/bcgov/cas-registration/commit/8ee6e039c9e6122211ff85e5961c9933b436b48f))
- create first migration ([3bc1878](https://github.com/bcgov/cas-registration/commit/3bc1878a4d8ab453f4b3aceacb01d9801cfee0ad))
- initial docker build workflow ([0ced76e](https://github.com/bcgov/cas-registration/commit/0ced76e34d193ee40c46ec10e380b643c56fa381))
- io user requests access to be prime admin for Operator pages ([a41c075](https://github.com/bcgov/cas-registration/commit/a41c07555cb2abb38dcf96315aa2d9344cd4904b))
- updated pre-commit ([e878a3c](https://github.com/bcgov/cas-registration/commit/e878a3c04a479b278309711d7a858eb418f3c4e8))

### Reverts

- Revert "chore: temporarily mock operator id" ([ca26952](https://github.com/bcgov/cas-registration/commit/ca269523d140e7260e0a6551be937432ab8f4bf4))
- Revert "chore: experiment with openapi-typescript-codegen" ([aef4b8e](https://github.com/bcgov/cas-registration/commit/aef4b8e9373c2dcdd408efe865c2165d54c574a5))
- Revert "chore: debug CI with tmate" ([0731f54](https://github.com/bcgov/cas-registration/commit/0731f5415f621b1a53757fae419b03d87db5881f))
