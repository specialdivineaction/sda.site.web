(function () {
  'use strict';

  angular
    .module('sdaAdmin')
    .controller('ShowWorkController', ShowWorkController);

  /** @ngInject */
  function ShowWorkController($state, $stateParams, worksRepo, relnRepo, refsRepoFactory, articlesRepo, $mdDialog, $mdToast, $q, workEditDialog, copyEditDialog, citationEditDialog, summaryEditDialog) {
    var refsRepo = null;
    var vm = this;

    vm.loading = true;
    vm.work = null;
    vm.title = null;
    vm.relationships = null;

    vm.editBibInfo = editBibInfo;
    vm.editSummary = editSummary;
    vm.editBibliography = editBibliography;
    vm.addEdition = addEdition;
    vm.deleteEdition = deleteEdition;
    vm.addCopy = addCopy;
    vm.editCopy = editCopy;
    vm.deleteCopy = deleteCopy;
    vm.createBookReview = createBookReviewArticle;
    vm.deleteWork = deleteWork;

    activate();

    function activate() {
      var workId = $stateParams.workId;

      vm.work = worksRepo.getWork(workId);

      vm.work.$promise.then(function () {
        vm.bcTitle = worksRepo.getTitle(vm.work.titles);
        vm.title = worksRepo.getTitle(vm.work.titles, ['canonical', 'bibliographic', 'short']);
        vm.anchor = relnRepo.createAnchor(worksRepo.getWorkLabel(vm.work), vm.work.ref.token);
      });

      var refsEndpointUrl = worksRepo.getReferencesEndpoint(workId);
      refsRepo = refsRepoFactory.getRepo(refsEndpointUrl);
      vm.references = refsRepo.get();

      $q.all([vm.work.$promise, vm.references.$promise]).then(function () {
        vm.loading = false;
      });
    }

    function editBibInfo($event) {
      var dialogPromise = workEditDialog.show($event, angular.copy(vm.work));

      dialogPromise.then(function (updatedWork) {
        // copy updates back to original only after dialog is positively dismissed (i.e. not canceled)
        angular.extend(vm.work, updatedWork);

        worksRepo.saveWork(vm.work).then(showSavedToast);
      });
    }

    function editSummary($event) {
      var dialogPromise = summaryEditDialog.show($event, angular.copy(vm.work.summary));

      dialogPromise.then(function (updatedSummary) {
        // copy updates back to original only after dialog is positively dismissed (i.e. not canceled)
        vm.work.summary = updatedSummary;

        worksRepo.saveWork(vm.work).then(showSavedToast);
      });
    }

    function editBibliography($event) {
      citationEditDialog.show(vm.references, null, $event).then(function () {
        refsRepo.save(vm.references).then(showSavedToast);
      });
    }

    function addEdition($event) {
      var prompt = $mdDialog.prompt()
        .targetEvent($event)
        .title('Create Edition')
        .textContent('Please provide a name for the new edition.')
        .placeholder('edition name')
        .ok('Create')
        .cancel('Cancel');

      var dialogPromise = $mdDialog.show(prompt);

      var savePromise = dialogPromise.then(function (editionName) {
        var edition = worksRepo.createEdition();
        edition.editionName = editionName;
        edition.titles = angular.copy(vm.work.titles);
        edition.authors = angular.copy(vm.work.authors);

        vm.work.editions.push(edition);

        // resolve to the created edition when save is successful
        return worksRepo.saveEdition(vm.work.id, edition);
      });

      savePromise.then(showSavedToast);

      savePromise.then(function (edition) {
        $state.go('editor.edition', { workId: vm.work.id, editionId: edition.id });
      });
    }

    function deleteEdition(edition, $event) {
      var confirm = $mdDialog.confirm()
        .targetEvent($event)
        .title('Confirm Deletion')
        .textContent('Are you sure you want to delete this edition?')
        .ok('Yes')
        .cancel('No');

      $mdDialog.show(confirm)
        .then(function () {
          var ix = vm.work.editions.indexOf(edition);
          if (ix >= 0) {
            vm.work.editions.splice(ix, 1);
            worksRepo.saveWork(vm.work).then(showSavedToast);
          }
        });
    }

    function addCopy($event) {
      var copy = {};
      editCopy(copy, $event).then(function () {
        vm.work.copies.push(copy);
      });
    }

    function editCopy(copy, $event) {
      var dialogPromise = copyEditDialog.show($event, angular.copy(copy));
      dialogPromise.then(function (updatedCopy) {
        // copy updates back to original only after dialog is positively dismised (i.e. not canceled)
        angular.extend(copy, updatedCopy);

        worksRepo.saveWork(vm.work).then(showSavedToast);
      });

      return dialogPromise;
    }

    function deleteCopy(copy, $event) {
      var confirm = $mdDialog.confirm()
        .targetEvent($event)
        .title('Confirm Deletion')
        .textContent('Are you sure you want to delete this copy?')
        .ok('Yes')
        .cancel('No');

      $mdDialog.show(confirm)
        .then(function () {
          var ix = vm.work.copies.indexOf(copy);
          if (ix >= 0) {
            vm.work.copies.splice(ix, 1);
            worksRepo.saveWork(vm.work).then(showSavedToast);
          }
        });
    }

    function deleteWork($event, work) {
      var title = worksRepo.getTitle(vm.work.titles);
      var workLabel = title ? '"' + title.title + (title.subtitle ? ': ' + title.subtitle : '') + '"' : 'this work';

      var confirmDialog = $mdDialog.confirm({
        targetEvent: $event,
        title: 'Confirm Deletion',
        textContent: 'Are you sure you want to delete ' + workLabel + '?',
        ok: 'Yes',
        cancel: 'No'
      });

      var confirmPromise = $mdDialog.show(confirmDialog);

      return confirmPromise.then(function () {
        return worksRepo.delete(work)
          .then(showSuccessToast, showErrorToast);
      });

      function showSuccessToast() {
        var message = workLabel + ' has been deleted.';
        var toast = $mdToast.simple()
          .textContent(message)
          .position('bottom right');

        $state.go('editor');

        return $mdToast.show(toast);
      }

      function showErrorToast() {
        var toast = $mdToast.simple()
          .textContent('Unable to delete ' + workLabel)
          .position('bottom right');

        return $mdToast.show(toast);
      }
    }

    function createBookReviewArticle($event, work) {
      var title = worksRepo.getTitle(work.titles);

      // prompt for article title
      var articleTitleDialog = $mdDialog.prompt({
        targetEvent: $event,
        title: 'Create Book Review',
        textContent: 'You are creating a new article attached to this work. Please enter a title for this article.',
        initialValue: title ? title.title + (title.subtitle ? ': ' + title.subtitle : '') : '[untitled work]',
        ok: 'Create',
        cancel: 'Cancel'
      });

      var titleP = $mdDialog.show(articleTitleDialog);

      titleP.then(function (title) {
        var articleP = articlesRepo.createLinked('book-review', title, work.ref.token);

        // redirect to article editor
        articleP.then(function (article) {
          $state.go('article.edit', {
            id: article.id
          });
        }, function () {
          var toast = $mdToast.simple()
          .textContent('Unable to create article.')
          .position('bottom right');

          return $mdToast.show(toast);
        });
      });
    }

    function showSavedToast() {
      var toast = $mdToast.simple()
        .textContent('Saved')
        .position('bottom right');

      return $mdToast.show(toast);
    }
  }

})();
