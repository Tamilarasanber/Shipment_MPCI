import React, { useEffect, useMemo, useState } from "react";
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Snackbar,
  Alert,
  Divider,
} from "@/components/ui/mui";
import { CssBaseline } from "@/components/ui/mui";
import { SaveIcon } from "@/components/ui/icons";
import { SendIcon } from "@/components/ui/icons";
import { Formik, Form } from "formik";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMPCIDetailsRequest,
  clearMPCIDetails,
  saveFilingRequest,
  submitFilingRequest,
  fetchStatusRequest,
  fetchSubmissionHistoryRequest,
} from "@/redux/actions/dubaiMpciAction";
import { useNavigate, useParams } from "react-router-dom";
import { createDubaiFilingSchema } from "./Validation/dubaiFiling.schema";
import { isUaeMpciCustomerRole } from "./utils/loginUserDataUtils";
import { buildInitialDubaiFilingValue } from "./InitialValues/initialDubaiFilingValue";
import { InfoOutlinedIcon } from "@/components/ui/icons";
import { SailingIcon } from "@/components/ui/icons";
import { AssignmentTurnedInIcon } from "@/components/ui/icons";
import { HistoryIcon } from "@/components/ui/icons";
import AccordionCard from "@/components/ui/AccordionCard";
import GeneralInfoSection from "./Components/GeneralInfoSection";
import JobDetailsSection from "./Components/JobDetailsSection";
import HBLDetailsSection from "./Components/HBLDetailsSection";
import StatusSection from "./Components/StatusSection";
import SubmissionHistorySection from "./Components/SubmissionHistorySection";
import ContainerHeaderSyncBridge from "./Components/ContainerHeaderSyncBridge";
import PreviewModal from "./Components/preview/PreviewModal";
import SubmitReviewDialog from "./Components/SubmitReviewDialog";
import LoadingComponent from "@/components/ui/LoadingComponent";
import {
  isGeneralInfoSectionComplete,
  isJobDetailsSectionComplete,
} from "./utils/sectionCompletion";
import { mapMPCIDetailsToFormik } from "./MapperLayer/mpciMapper";

const DubaiMPCIFiling = () => {
  const { masterId } = useParams();
  const navigate = useNavigate();
  const { themeDetails } = useSelector((state) => state.Theme);
  const { loginUserData } = useSelector((state) => state.Login);
  const dispatch = useDispatch();
  const {
    saving,
    submitting,
    lastSavedId,
    error: saveError,
  } = useSelector((state) => state.DubaiFormFiling?.filing || {});
  const { data, loading: detailsLoading } = useSelector(
    (state) => state.DubaiFormFiling.selectedMPCIDetails,
  );
  // const isPageLoading = saving || submitting || detailsLoading;
  const isPageLoading =  detailsLoading;
  const statusHistoryMasterId = masterId || data?.masterId || data?.id || null;
  const effectiveMasterId =
    masterId || data?.masterId || data?.id || lastSavedId;
  const saveButtonLabel = effectiveMasterId ? "Update" : "Save";
  const mappedInitialValues = useMemo(() => {
    if (data) return mapMPCIDetailsToFormik(data);
    return buildInitialDubaiFilingValue(loginUserData);
  }, [data, loginUserData]);
  const requireEfsAgentName = !isUaeMpciCustomerRole(loginUserData);
  const validationSchema = useMemo(
    () => createDubaiFilingSchema({ requireEfsAgentName }),
    [requireEfsAgentName],
  );

  useEffect(() => {
    if (masterId) {
      dispatch(fetchMPCIDetailsRequest(masterId));
      dispatch(fetchStatusRequest({ masterId }));
      dispatch(fetchSubmissionHistoryRequest({ masterId }));
      return;
    }

    dispatch(clearMPCIDetails());
  }, [dispatch, masterId]);

  // const [hblList, setHblList] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [submitReviewOpen, setSubmitReviewOpen] = useState(false);
  const [navigateAfterCreate, setNavigateAfterCreate] = useState(false);
  const [refreshAfterSave, setRefreshAfterSave] = useState(null);
  const [previewData, setPreviewData] = useState(() =>
    buildInitialDubaiFilingValue(loginUserData),
  );
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  /* ---------- Helpers ---------- */
  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const getNormalizedBlIds = (formValues) => {
    const fromForm = Array.isArray(formValues?.hblList)
      ? formValues.hblList
          .map((hbl) => Number(hbl?.id ?? hbl?.blId))
          .filter((id) => Number.isFinite(id) && id > 0)
      : [];

    if (fromForm.length > 0) return fromForm;

    const fromApi = Array.isArray(data?.blDetailsList)
      ? data.blDetailsList
          .map((bl) => Number(bl?.id ?? bl?.blId))
          .filter((id) => Number.isFinite(id) && id > 0)
      : [];

    return fromApi;
  };

  // const handlePreview = async (values, validateForm, setTouched) => {
  //   const errors = await validateForm();
  //   if (Object.keys(errors).length === 0) {
  //     setPreviewData(values);
  //     setPreviewOpen(true);
  //     return;
  //   }

  //   setTouched(
  //     Object.keys(errors).reduce((a, k) => ({ ...a, [k]: true }), {}),
  //     true,
  //   );

  //   showSnackbar(
  //     `Fix validation errors in: ${Object.keys(errors).join(", ")}`,
  //     "error",
  //   );
  // };
  const handlePreview = (values) => {
    setPreviewData(values);
    setPreviewOpen(true);
  };

  /* ---------- API Actions ---------- */
  const handleSubmit = (values, actions, selectedBlIdsOverride = null) => {
    if (!effectiveMasterId) {
      showSnackbar("Please save filing first, then submit.", "error");
      actions.setSubmitting(false);
      return;
    }

    const normalizedSelectedBlIds = Array.isArray(selectedBlIdsOverride)
      ? selectedBlIdsOverride
          .map((id) => Number(id))
          .filter((id) => Number.isFinite(id) && id > 0)
      : [];
    const blIds =
      normalizedSelectedBlIds.length > 0
        ? normalizedSelectedBlIds
        : getNormalizedBlIds(values);
    if (!blIds.length) {
      showSnackbar(
        "BL IDs are not ready yet. Please click Save and try Submit again.",
        "error",
      );
      actions.setSubmitting(false);
      return;
    }

    dispatch(
      submitFilingRequest({
        formData: values,
        masterId: effectiveMasterId,
        blIds,
        loginUserData,
        // hblList,
      }),
    );
    actions.setSubmitting(false);
  };

  const handleSave = (values) => {
    const isCreateFlow = !effectiveMasterId;
    const targetMasterId = effectiveMasterId || lastSavedId || null;

    dispatch(
      saveFilingRequest({
        formData: values,
        masterId: effectiveMasterId,
        loginUserData,
      }),
    );

    setRefreshAfterSave({
      isCreateFlow,
      masterId: targetMasterId,
    });

    if (isCreateFlow) {
      setNavigateAfterCreate(true);
    }
  };

  useEffect(() => {
    if (!navigateAfterCreate) return;
    if (!lastSavedId) return;

    navigate(`/uae-mpci/filing/${lastSavedId}`, { replace: true });
    setNavigateAfterCreate(false);
  }, [navigateAfterCreate, lastSavedId, navigate]);

  useEffect(() => {
    if (!refreshAfterSave) return;
    if (saving) return;

    if (saveError) {
      setRefreshAfterSave(null);
      return;
    }

    const refreshedMasterId =
      refreshAfterSave.masterId || lastSavedId || effectiveMasterId;

    if (!refreshedMasterId) {
      setRefreshAfterSave(null);
      return;
    }

    if (!refreshAfterSave.isCreateFlow) {
      dispatch(fetchMPCIDetailsRequest(refreshedMasterId));
      dispatch(fetchStatusRequest({ masterId: refreshedMasterId }));
      dispatch(fetchSubmissionHistoryRequest({ masterId: refreshedMasterId }));
    }

    setRefreshAfterSave(null);
  }, [
    refreshAfterSave,
    saving,
    saveError,
    lastSavedId,
    effectiveMasterId,
    dispatch,
  ]);

  const handleRefreshStatusAndHistory = () => {
    if (!statusHistoryMasterId) return;

    dispatch(fetchStatusRequest({ masterId: statusHistoryMasterId }));
    dispatch(
      fetchSubmissionHistoryRequest({ masterId: statusHistoryMasterId }),
    );
  };

  return (
    <>
      {isPageLoading && <LoadingComponent />}
      <CssBaseline />

      <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f6fa", py: 2 }}>
        <Container maxWidth={false} disableGutters sx={{ px: 2 }}>
          <Typography variant="h5" fontWeight={600} mb={3}>
            UAE MPCI Filing
          </Typography>

          <Formik
            initialValues={mappedInitialValues}
            enableReinitialize
            validationSchema={validationSchema}
            validateOnMount={true}
            validateOnChange={true}
            validateOnBlur={true}
            onSubmit={handleSubmit}
          >
            {({
              values,
              isSubmitting,
              isValid,
              dirty,
              // setFieldValue,
              // validateForm,
              // setTouched,
              errors,
            }) => {
              // console.log("Values", values)
              // console.log(JSON.stringify(values, null,2))
              // console.log("Errors", errors)
              // console.log(JSON.stringify(errors, null, 2))
              // const actionHandlers = {
              //   New: handleSave,
              //   Update: handleUpdate,
              //   Cancel: handleUpdate,
              // };

              // const actionLabels = {
              //   New: "Save",
              //   Update: "Update",
              //   Cancel: "Update",
              // };

              // const actionHandler = actionHandlers[values.actionCode];
              // const actionLabel = actionLabels[values.actionCode];
              const isGeneralInfoComplete = isGeneralInfoSectionComplete(
                values,
                errors,
                loginUserData,
              );
              const isJobDetailsComplete = isJobDetailsSectionComplete(
                values,
                errors,
              );
              const isActionLoading = saving || submitting || isSubmitting;

              return (
                <Form>
                  <ContainerHeaderSyncBridge />
                  {/* {isActionLoading && <LoadingComponent />} */}

                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 3 }}
                  >
                    <AccordionCard
                      title="General Info"
                      completed={isGeneralInfoComplete}
                      icon={
                        <InfoOutlinedIcon
                          sx={{ color: "#fff", fontSize: 20 }}
                        />
                      }
                      defaultExpanded={true}
                    >
                      <GeneralInfoSection />
                    </AccordionCard>

                    <AccordionCard
                      title="Job Details"
                      completed={isJobDetailsComplete}
                      icon={
                        <SailingIcon
                          sx={{
                            color: "#fff",
                            fontSize: 20,
                            filter:
                              "drop-shadow(0 0 4px rgba(255,255,255,0.6))",
                          }}
                        />
                      }
                      defaultExpanded={true}
                    >
                      <JobDetailsSection />
                    </AccordionCard>

                    {/* <HBLDetailsSection onHBLChange={setHblList} /> */}
                    <HBLDetailsSection />

                    <AccordionCard
                      title="Status"
                      icon={
                        <AssignmentTurnedInIcon
                          sx={{ color: "#fff", fontSize: 20 }}
                        />
                      }
                      defaultExpanded={false}
                    >
                      <StatusSection
                        onRefresh={handleRefreshStatusAndHistory}
                        masterId={statusHistoryMasterId}
                      />
                    </AccordionCard>

                    <AccordionCard
                      title="Submission History"
                      icon={<HistoryIcon sx={{ color: "#fff" }} />}
                      defaultExpanded={false}
                    >
                      <SubmissionHistorySection
                        onRefresh={handleRefreshStatusAndHistory}
                        masterId={statusHistoryMasterId}
                      />
                    </AccordionCard>
                  </Box>

                  <Paper sx={{ p: 3, mt: 3 }}>
                    <Divider sx={{ mb: 3 }} />
                    <Box
                      sx={{
                        display: "flex",
                        gap: 2,
                        justifyContent: "flex-end",
                      }}
                    >
                      <Button
                        variant="outlined"
                        startIcon={<SaveIcon />}
                        disabled={isActionLoading || !dirty || !isValid}
                        onClick={() => handleSave(values)}
                      >
                        {saveButtonLabel}
                      </Button>
                      {/* <Button
                        variant="outlined"
                        startIcon={<SaveIcon />}
                        disabled={
                          saving ||
                          !dirty ||
                          !isValid ||
                          !values.actionCode || // safety
                          !actionHandler
                        }
                        onClick={() => actionHandler(values)}
                      >
                        {actionLabel}
                      </Button> */}

                      <Button
                        variant="contained"
                        startIcon={<SendIcon />}
                        disabled={
                          isActionLoading || !isValid || !effectiveMasterId
                        }
                        onClick={() => setSubmitReviewOpen(true)}
                      >
                        Submit
                      </Button>
                    </Box>
                  </Paper>

                  <SubmitReviewDialog
                    open={submitReviewOpen}
                    onClose={() => setSubmitReviewOpen(false)}
                    submitDisabled={
                      isActionLoading || !isValid || !effectiveMasterId
                    }
                    submitLoading={isActionLoading}
                    onPreviewAction={() => {
                      setSubmitReviewOpen(false);
                      handlePreview(values);
                    }}
                    onSubmitAction={(selectedBlIds) => {
                      setSubmitReviewOpen(false);
                      handleSubmit(
                        values,
                        { setSubmitting: () => {} },
                        selectedBlIds,
                      );
                    }}
                    themeDetails={themeDetails}
                  />
                </Form>
              );
            }}
          </Formik>
        </Container>
      </Box>

      <PreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        formData={previewData}
        // hblList={hblList}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </>
  );
};

export default DubaiMPCIFiling;
