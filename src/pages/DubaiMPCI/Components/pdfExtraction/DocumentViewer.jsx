import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Box, IconButton, Stack, Tooltip, Typography } from "@/components/ui/mui";
import { ZoomInIcon } from "@/components/ui/icons";
import { ZoomOutIcon } from "@/components/ui/icons";
import { CropFreeIcon } from "@/components/ui/icons";
import { RotateRightIcon } from "@/components/ui/icons";
import { NavigateBeforeIcon } from "@/components/ui/icons";
import { NavigateNextIcon } from "@/components/ui/icons";
import { pdfjsLib } from "./pdfjsSetup";

const MIN_SCALE = 0.4;
const MAX_SCALE = 3;
const SCALE_STEP = 0.2;

const isPdfFile = (file) =>
  file?.type === "application/pdf" ||
  /\.pdf$/i.test(file?.name || "");

// Renders the active uploaded file (PDF or image) with zoom / rotate / page nav,
// hand-pan when zoomed, and its own scroll area. Kept self-contained.
const DocumentViewer = ({ file }) => {
  const isPdf = useMemo(() => isPdfFile(file), [file]);

  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [numPages, setNumPages] = useState(1);
  const [docVersion, setDocVersion] = useState(0);
  const [loadError, setLoadError] = useState("");
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);

  const canvasRef = useRef(null);
  const pdfDocRef = useRef(null);
  const renderTaskRef = useRef(null);
  const panStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  const resetPan = useCallback(() => setPan({ x: 0, y: 0 }), []);

  // Reset view whenever the active file changes.
  useEffect(() => {
    setScale(1);
    setRotation(0);
    setPageNumber(1);
    setNumPages(1);
    setLoadError("");
    resetPan();
  }, [file, resetPan]);

  // Object URL for image files.
  const imageUrl = useMemo(() => {
    if (!file || isPdf) return "";
    return URL.createObjectURL(file);
  }, [file, isPdf]);

  useEffect(
    () => () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
    },
    [imageUrl],
  );

  // Load the PDF document once per file.
  useEffect(() => {
    if (!file || !isPdf) {
      pdfDocRef.current = null;
      return undefined;
    }

    let cancelled = false;
    const loadDoc = async () => {
      try {
        const buffer = await file.arrayBuffer();
        const doc = await pdfjsLib.getDocument({ data: buffer }).promise;
        if (cancelled) {
          await doc.destroy();
          return;
        }
        pdfDocRef.current = doc;
        setNumPages(doc.numPages);
        setPageNumber(1);
        setDocVersion((prev) => prev + 1);
      } catch (error) {
        if (!cancelled) {
          setLoadError(error?.message || "Unable to load PDF");
        }
      }
    };

    void loadDoc();

    return () => {
      cancelled = true;
      const doc = pdfDocRef.current;
      pdfDocRef.current = null;
      if (doc) void doc.destroy();
    };
  }, [file, isPdf]);

  // Render the current PDF page whenever page / scale / rotation changes.
  useEffect(() => {
    if (!isPdf) return undefined;

    let cancelled = false;
    const renderPage = async () => {
      const doc = pdfDocRef.current;
      const canvas = canvasRef.current;
      if (!doc || !canvas) return;

      try {
        const page = await doc.getPage(pageNumber);
        if (cancelled) return;

        const viewport = page.getViewport({ scale, rotation });
        const context = canvas.getContext("2d");
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();
        }

        const task = page.render({ canvasContext: context, viewport });
        renderTaskRef.current = task;
        await task.promise;
      } catch (error) {
        if (!cancelled && error?.name !== "RenderingCancelledException") {
          setLoadError(error?.message || "Unable to render PDF page");
        }
      }
    };

    void renderPage();

    return () => {
      cancelled = true;
    };
  }, [isPdf, pageNumber, scale, rotation, docVersion]);

  const handlePanStart = useCallback(
    (event) => {
      if (event.button !== 0 || loadError) return;
      event.preventDefault();
      setIsPanning(true);
      panStartRef.current = {
        x: event.clientX,
        y: event.clientY,
        panX: pan.x,
        panY: pan.y,
      };
    },
    [loadError, pan.x, pan.y],
  );

  useEffect(() => {
    if (!isPanning) return undefined;

    const handlePanMove = (event) => {
      const dx = event.clientX - panStartRef.current.x;
      const dy = event.clientY - panStartRef.current.y;
      setPan({
        x: panStartRef.current.panX + dx,
        y: panStartRef.current.panY + dy,
      });
    };

    const handlePanEnd = () => setIsPanning(false);

    window.addEventListener("mousemove", handlePanMove);
    window.addEventListener("mouseup", handlePanEnd);

    return () => {
      window.removeEventListener("mousemove", handlePanMove);
      window.removeEventListener("mouseup", handlePanEnd);
    };
  }, [isPanning]);

  const zoomIn = () => {
    setScale((prev) => Math.min(MAX_SCALE, +(prev + SCALE_STEP).toFixed(2)));
  };
  const zoomOut = () => {
    setScale((prev) => Math.max(MIN_SCALE, +(prev - SCALE_STEP).toFixed(2)));
  };
  const resetZoom = () => {
    setScale(1);
    setRotation(0);
    resetPan();
  };
  const rotate = () => {
    setRotation((prev) => (prev + 90) % 360);
    resetPan();
  };
  const prevPage = () => {
    setPageNumber((prev) => Math.max(1, prev - 1));
    resetPan();
  };
  const nextPage = () => {
    setPageNumber((prev) => Math.min(numPages, prev + 1));
    resetPan();
  };

  if (!file) {
    return (
      <Box
        sx={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "text.secondary",
        }}
      >
        <Typography variant="body2">No document selected</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#525659",
      }}
    >
      {/* Toolbar */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ px: 1, py: 0.5, bgcolor: "#323639", color: "#fff", flexShrink: 0 }}
      >
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Tooltip title="Zoom out">
            <span>
              <IconButton
                size="small"
                onClick={zoomOut}
                disabled={scale <= MIN_SCALE}
                sx={{ color: "#fff" }}
              >
                <ZoomOutIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Typography variant="caption" sx={{ minWidth: 42, textAlign: "center" }}>
            {Math.round(scale * 100)}%
          </Typography>
          <Tooltip title="Zoom in">
            <span>
              <IconButton
                size="small"
                onClick={zoomIn}
                disabled={scale >= MAX_SCALE}
                sx={{ color: "#fff" }}
              >
                <ZoomInIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Fit / reset">
            <IconButton size="small" onClick={resetZoom} sx={{ color: "#fff" }}>
              <CropFreeIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Rotate">
            <IconButton size="small" onClick={rotate} sx={{ color: "#fff" }}>
              <RotateRightIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>

        {isPdf && (
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Tooltip title="Previous page">
              <span>
                <IconButton
                  size="small"
                  onClick={prevPage}
                  disabled={pageNumber <= 1}
                  sx={{ color: "#fff" }}
                >
                  <NavigateBeforeIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <Typography variant="caption">
              Page {pageNumber} of {numPages}
            </Typography>
            <Tooltip title="Next page">
              <span>
                <IconButton
                  size="small"
                  onClick={nextPage}
                  disabled={pageNumber >= numPages}
                  sx={{ color: "#fff" }}
                >
                  <NavigateNextIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        )}
      </Stack>

      {/* Document viewport — top-aligned, horizontally centered; click-drag to pan */}
      <Box
        onMouseDown={handlePanStart}
        sx={{
          flex: 1,
          overflow: "hidden",
          position: "relative",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          pt: 2,
          cursor: loadError ? "default" : isPanning ? "grabbing" : "grab",
          userSelect: "none",
        }}
      >
        <Box
          sx={{
            transform: `translate(${pan.x}px, ${pan.y}px)`,
            transformOrigin: "top center",
          }}
        >
          {loadError ? (
            <Typography sx={{ color: "#ffb4b4", mt: 4 }} variant="body2">
              {loadError}
            </Typography>
          ) : isPdf ? (
            <canvas
              ref={canvasRef}
              draggable={false}
              style={{
                boxShadow: "0 0 8px rgba(0,0,0,0.5)",
                background: "#fff",
                display: "block",
              }}
            />
          ) : (
            <img
              src={imageUrl}
              alt={file?.name || "document"}
              draggable={false}
              style={{
                transform: `scale(${scale}) rotate(${rotation}deg)`,
                transformOrigin: "top center",
                maxWidth: "none",
                width: "auto",
                height: "auto",
                boxShadow: "0 0 8px rgba(0,0,0,0.5)",
                background: "#fff",
                display: "block",
              }}
            />
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default memo(DocumentViewer);
