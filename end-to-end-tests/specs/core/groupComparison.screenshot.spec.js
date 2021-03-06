var assert = require('assert');
var goToUrlAndSetLocalStorage = require('./../specUtils').goToUrlAndSetLocalStorage;
var waitForNetworkQuiet = require('./../specUtils').waitForNetworkQuiet;
var assertScreenShotMatch = require('../../lib/testUtils').assertScreenShotMatch;
var setInputText = require('./../specUtils').setInputText;
var checkElementWithTemporaryClass = require('./../specUtils').checkElementWithTemporaryClass;
var checkElementWithMouseDisabled = require('./../specUtils').checkElementWithMouseDisabled;

const CBIOPORTAL_URL = process.env.CBIOPORTAL_URL.replace(/\/$/, "");


describe("group comparison page screenshot tests", function () {
    describe("general screenshot tests", function() {
        before(function () {
            goToUrlAndSetLocalStorage(`${CBIOPORTAL_URL}/comparison?sessionId=5ce411c7e4b0ab4137874076`);
            browser.waitForVisible('div[data-test="ComparisonPageOverlapTabDiv"]', 20000);
        });
        it("group comparison page overlap tab upset plot view", function () {
            browser.moveToObject("body", 0, 0);
            var res = browser.checkElement('div[data-test="ComparisonPageOverlapTabDiv"]', { hide: ['.qtip'] });
            assertScreenShotMatch(res);
        });

        it("group comparison page survival tab exclude overlapping samples", () => {
            assert(browser.isVisible('a.tabAnchor_survival'));
            browser.click("a.tabAnchor_survival");
            browser.waitForVisible('div[data-test="ComparisonPageSurvivalTabDiv"]', 60000);
            browser.moveToObject("body", 0, 0);
            var res = browser.checkElement('div[data-test="ComparisonPageSurvivalTabDiv"]', { hide: ['.qtip'] });
            assertScreenShotMatch(res);
        });

        it("group comparison page survival tab include overlapping samples", function () {
            browser.execute(function () { groupComparisonPage.onOverlapStrategySelect({ value: "Include" }); });
            waitForNetworkQuiet();
            browser.waitForExist('div[data-test="ComparisonPageSurvivalTabDiv"]', 60000);
            browser.moveToObject("body", 0, 0);
            var res = browser.checkElement('div[data-test="ComparisonPageSurvivalTabDiv"]', { hide: ['.qtip'] });
            assertScreenShotMatch(res);
        });

        it("group comparison page clinical tab include overlapping samples Kruskal Wallis test", function () {
            assert(browser.isVisible('a.tabAnchor_clinical'));
            browser.click("a.tabAnchor_clinical");
            waitForNetworkQuiet();
            browser.waitForVisible('div[data-test="ComparisonPageClinicalTabDiv"] div[data-test="PlotsTabPlotDiv"]', 20000);
            browser.moveToObject("body", 0, 0);
            var res = browser.checkElement('div[data-test="ComparisonPageClinicalTabDiv"]', { hide: ['.qtip'] });
            assertScreenShotMatch(res);
        });

        it("group comparison page clinical tab swaped axes Kruskal Wallis test", function () {
            browser.click('div[data-test="ComparisonPageClinicalTabDiv"] input[data-test="SwapAxes"]');
            browser.waitForVisible('div[data-test="ComparisonPageClinicalTabDiv"] div[data-test="PlotsTabPlotDiv"]', 20000);
            browser.moveToObject("body", 0, 0);
            var res = browser.checkElement('div[data-test="ComparisonPageClinicalTabDiv"]', { hide: ['.qtip'] });
            assertScreenShotMatch(res);
        });


        it("group comparison page clinical tab log scale  Kruskal Wallis test", function () {
            browser.click('div[data-test="ComparisonPageClinicalTabDiv"] input[data-test="logScale"]');
            browser.waitForVisible('div[data-test="ComparisonPageClinicalTabDiv"] div[data-test="PlotsTabPlotDiv"]', 20000);
            browser.moveToObject("body", 0, 0);
            var res = browser.checkElement('div[data-test="ComparisonPageClinicalTabDiv"]', { hide: ['.qtip'] });
            assertScreenShotMatch(res);
        });


        it("group comparison page clinical tab percentage stacked bar chart exclude overlapping samples Chi squared test", function () {
            browser.execute(function () { groupComparisonPage.onOverlapStrategySelect({ value: "Exclude" }); });
            waitForNetworkQuiet();
            browser.waitForVisible('div[data-test="ComparisonPageClinicalTabDiv"] div[data-test="PlotsTabPlotDiv"]', 20000);
            browser.moveToObject("body", 0, 0);
            var res = browser.checkElement('div[data-test="ComparisonPageClinicalTabDiv"]', { hide: ['.qtip'] });
            assertScreenShotMatch(res);
        });

        it("group comparison page clinical tab bar chart Chi squared test", function () {
            var plotTypeSelector = $('[data-test="plotTypeSelector"] .Select-input input');
            plotTypeSelector.setValue('Bar chart');
            browser.click('[data-test="plotTypeSelector"] .Select-option');
            browser.waitForVisible('div[data-test="ComparisonPageClinicalTabDiv"] div[data-test="PlotsTabPlotDiv"]', 20000);
            browser.moveToObject("body", 0, 0);
            var res = browser.checkElement('div[data-test="ComparisonPageClinicalTabDiv"]', { hide: ['.qtip'] });
            assertScreenShotMatch(res);
        });

        it("group comparison page clinical tab stacked bar chart Chi squared test", function () {
            var plotTypeSelector = $('[data-test="plotTypeSelector"] .Select-input input');
            plotTypeSelector.setValue('Stacked bar chart');
            browser.click('[data-test="plotTypeSelector"] .Select-option');
            browser.waitForVisible('div[data-test="ComparisonPageClinicalTabDiv"] div[data-test="PlotsTabPlotDiv"]', 20000);
            browser.moveToObject("body", 0, 0);
            var res = browser.checkElement('div[data-test="ComparisonPageClinicalTabDiv"]', { hide: ['.qtip'] });
            assertScreenShotMatch(res);
        });

        it("group comparison page clinical tab stacked bar chart swaped axes Chi squared test", function () {
            browser.click('div[data-test="ComparisonPageClinicalTabDiv"] input[data-test="SwapAxes"]');
            browser.waitForVisible('div[data-test="ComparisonPageClinicalTabDiv"] div[data-test="PlotsTabPlotDiv"]', 20000);
            browser.moveToObject("body", 0, 0);
            var res = browser.checkElement('div[data-test="ComparisonPageClinicalTabDiv"]', { hide: ['.qtip'] });
            assertScreenShotMatch(res);
        });

        it("group comparison page clinical tab stacked bar chart horizontal bars Chi squared test", function () {
            browser.click('div[data-test="ComparisonPageClinicalTabDiv"] input[data-test="SwapAxes"]');
            browser.click('div[data-test="ComparisonPageClinicalTabDiv"] input[data-test="HorizontalBars"]');
            browser.waitForVisible('div[data-test="ComparisonPageClinicalTabDiv"] div[data-test="PlotsTabPlotDiv"]', 20000);
            browser.moveToObject("body", 0, 0);
            var res = browser.checkElement('div[data-test="ComparisonPageClinicalTabDiv"]', { hide: ['.qtip'] });
            assertScreenShotMatch(res);
        });

        it("group comparison page mutation enrichments tab several groups", function() {
            browser.click('.tabAnchor_mutations');
            browser.waitForVisible('div[data-test="GroupComparisonMutationEnrichments"]', 10000);
            browser.moveToObject("body", 0, 0);
            var res = browser.checkElement('.msk-tab:not(.hiddenByPosition)', { hide: ['.qtip'] });
            assertScreenShotMatch(res);
        });

        it("group comparison page mutation enrichments tab 20 genes with highest frequency in any group", function() {
            browser.click('[data-test="selectGenes"]')
            var input = $("input[data-test=numberOfGenes]");
            input.setValue('20\n');
            browser.waitForEnabled('[data-test="addGenestoBarPlot"]', 10000);
            browser.click('[data-test="addGenestoBarPlot"]')
            browser.waitForVisible('div[data-test="GeneBarPlotDiv"]', 10000);
            browser.moveToObject("body", 0, 0);
            var res = browser.checkElement('div[data-test="GeneBarPlotDiv"]', { hide: ['.qtip'] });
            assertScreenShotMatch(res);
        });
    
        it("group comparison page mutation enrichments tab gene box highest average frequency", function() {
            browser.click('[data-test="selectGenes"]')
            browser.execute(function () { genesSelection.onGeneListOptionChange({ label: "Genes with highest average frequency" }); });
            waitForNetworkQuiet();
            browser.waitForEnabled('[data-test="addGenestoBarPlot"]', 10000);
            browser.click('[data-test="addGenestoBarPlot"]')
            browser.waitForVisible('div[data-test="GeneBarPlotDiv"]', 10000);
            browser.moveToObject("body", 0, 0);
            var res = browser.checkElement('div[data-test="GeneBarPlotDiv"]', { hide: ['.qtip'] });
            assertScreenShotMatch(res);
        });
    
        it("group comparison page mutation enrichments tab gene box most significant pValues", function() {
            browser.click('[data-test="selectGenes"]')
            browser.execute(function () { genesSelection.onGeneListOptionChange({ label: "Genes with most significant p-value" }); });
            waitForNetworkQuiet();
            browser.waitForEnabled('[data-test="addGenestoBarPlot"]', 10000);
            browser.click('[data-test="addGenestoBarPlot"]')
            browser.waitForVisible('div[data-test="GeneBarPlotDiv"]', 10000);
            browser.moveToObject("body", 0, 0);
            var res = browser.checkElement('div[data-test="GeneBarPlotDiv"]', { hide: ['.qtip'] });
            assertScreenShotMatch(res);
        });
    
        it("group comparison page mutation enrichments tab gene box user-defined genes", function() {
            browser.click('[data-test="selectGenes"]')
            setInputText('textarea[data-test="geneSet"]', "MUC16 MUC4 ERCC2 TP53 ZNRF3 CTNNB1");
            waitForNetworkQuiet();
            browser.waitForEnabled('[data-test="addGenestoBarPlot"]', 10000);
            browser.click('[data-test="addGenestoBarPlot"]')
            browser.waitForVisible('div[data-test="GeneBarPlotDiv"]', 10000);
            browser.moveToObject("body", 0, 0);
            var res = browser.checkElement('div[data-test="GeneBarPlotDiv"]', { hide: ['.qtip'] });
            assertScreenShotMatch(res);
        });

        it("group comparison page cna enrichments tab several groups", function() {
            browser.click('.tabAnchor_cna');
            browser.waitForVisible('div[data-test="GroupComparisonCopyNumberEnrichments"]', 10000);
            browser.moveToObject("body", 0, 0);
            var res = browser.checkElement('.msk-tab:not(.hiddenByPosition)', { hide: ['.qtip'] });
            assertScreenShotMatch(res);
        });

        it("group comparison page mutation enrichments tab two groups", function() {
            // deselect two groups
            browser.click('button[data-test="groupSelectorButtonA"]');
            browser.waitForExist('button[data-test="groupSelectorButtonD"]', 10000);
            browser.click('button[data-test="groupSelectorButtonD"]');
            // go back to mutations tab
            browser.waitForExist('.tabAnchor_mutations', 10000);
            browser.click('.tabAnchor_mutations');
            browser.waitForVisible('div[data-test="GroupComparisonMutationEnrichments"]', 10000);
            browser.moveToObject("body", 0, 0);
            var res = browser.checkElement('.msk-tab:not(.hiddenByPosition)', { hide: ['.qtip'] });
            assertScreenShotMatch(res);
        });

        it("group comparison page cna enrichments tab two groups", function() {
            browser.click('.tabAnchor_cna');
            browser.waitForVisible('div[data-test="GroupComparisonCopyNumberEnrichments"]', 10000);
            browser.moveToObject("body", 0, 0);
            var res = browser.checkElement('.msk-tab:not(.hiddenByPosition)', { hide: ['.qtip'] });
            assertScreenShotMatch(res);
        });

        it("group comparison page mrna enrichments tab two groups", function() {
            browser.click('.tabAnchor_mrna');
            browser.waitForVisible('div[data-test="GroupComparisonMRNAEnrichments"]', 10000);
            browser.moveToObject("body", 0, 0);
            var res = browser.checkElement('.msk-tab:not(.hiddenByPosition)', { hide: ['.qtip'] });
            assertScreenShotMatch(res);
        });

        it("group comparison page protein enrichments tab two groups", function() {
            browser.click('.tabAnchor_protein');
            browser.waitForVisible('div[data-test="GroupComparisonProteinEnrichments"]', 10000);
            browser.moveToObject("body", 0, 0);
            var res = browser.checkElement('.msk-tab:not(.hiddenByPosition)', { hide: ['.qtip'] });
            assertScreenShotMatch(res);
        });
    });

    describe("delete group from session", function() {
        before(function () {
            goToUrlAndSetLocalStorage(`${CBIOPORTAL_URL}/comparison?sessionId=5ce411c7e4b0ab4137874076`);
            browser.waitForVisible('div[data-test="ComparisonPageOverlapTabDiv"]', 20000);
        });
        it("group comparison page delete group from session", function() {
            browser.click('button[data-test="groupSelectorButtonA"] [data-test="deleteButton"]');
            var res = checkElementWithMouseDisabled('div.mainContainer');
            assertScreenShotMatch(res);
        });
    });

    describe("overlap venn diagram", function() {
        describe('disjoint diagram', function() {
            before(function () {
                goToUrlAndSetLocalStorage(`${CBIOPORTAL_URL}/comparison?sessionId=5cf8b1b3e4b0ab413787436f`);
                browser.waitForVisible('div[data-test="ComparisonPageOverlapTabDiv"]', 20000);
            });

            it("group comparison page overlap tab disjoint venn diagram view", function () {
                var res = checkElementWithTemporaryClass('div[data-test="ComparisonPageOverlapTabDiv"]', 'div[data-test="ComparisonPageOverlapTabDiv"]', "disablePointerEvents", 0);
                assertScreenShotMatch(res);
            });

            it("group comparison page overlap tab disjoint venn diagram view with a group selected view", function () {
                browser.waitForVisible('svg#comparison-tab-overlap-svg', 6000);
                browser.leftClick('rect[data-test="sample0VennRegion"]');
                var res = checkElementWithTemporaryClass('div[data-test="ComparisonPageOverlapTabDiv"]', 'div[data-test="ComparisonPageOverlapTabDiv"]', "disablePointerEvents", 0);
                assertScreenShotMatch(res);
            });
        });

        describe('venn diagram with overlap', function() {
            before(function () {
                goToUrlAndSetLocalStorage(`${CBIOPORTAL_URL}/comparison/overlap?sessionId=5cf6bcf0e4b0ab413787430c`);
                browser.waitForVisible('div[data-test="ComparisonPageOverlapTabDiv"]', 20000);
            });

            it("group comparison page overlap tab venn diagram with overlap view", function () {
                var res = checkElementWithTemporaryClass('div[data-test="ComparisonPageOverlapTabDiv"]', 'div[data-test="ComparisonPageOverlapTabDiv"]', "disablePointerEvents", 0);
                assertScreenShotMatch(res);
            });

            it("group comparison page overlap tab venn diagram view with overlap and session selected view", function () {
                browser.leftClick('rect[data-test="sample0,1,2VennRegion"]');
                var res = checkElementWithTemporaryClass('div[data-test="ComparisonPageOverlapTabDiv"]', 'div[data-test="ComparisonPageOverlapTabDiv"]', "disablePointerEvents", 0);
                assertScreenShotMatch(res);
            });

            it("group comparison page overlap tab venn diagram view with overlap deselect active group", function () {
                browser.click('button[data-test="groupSelectorButtonC"]');
                var res = checkElementWithTemporaryClass('div[data-test="ComparisonPageOverlapTabDiv"]', 'div[data-test="ComparisonPageOverlapTabDiv"]', "disablePointerEvents", 0);
                assertScreenShotMatch(res);
            });
        });
    });

    describe("overlap upset diagram group selection", function() {
        before(function () {
            goToUrlAndSetLocalStorage(`${CBIOPORTAL_URL}/comparison?sessionId=5d0bc0c5e4b0ab4137876bc3`);
            browser.waitForVisible('div[data-test="ComparisonPageOverlapTabDiv"]', 20000);
        });

        it("group comparison page overlap tab upset groups selected", function () {
            browser.leftClick('.sample_testGroup5_bar');
            browser.leftClick('.sample_testGroup1_testGroup2_bar');
            browser.leftClick('.patient_testGroup1_bar');
            var res = checkElementWithTemporaryClass('div[data-test="ComparisonPageOverlapTabDiv"]', 'div[data-test="ComparisonPageOverlapTabDiv"]', "disablePointerEvents", 0);
            assertScreenShotMatch(res);
        });

        it("group comparison page overlap tab upset deselect active group", function () {
            browser.click('button[data-test="groupSelectorButtonD"]');
            var res = checkElementWithTemporaryClass('div[data-test="ComparisonPageOverlapTabDiv"]', 'div[data-test="ComparisonPageOverlapTabDiv"]', "disablePointerEvents", 0);
            assertScreenShotMatch(res);
        });
    });
});
