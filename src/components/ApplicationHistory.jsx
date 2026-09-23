import { useEffect, useState } from "react";

import {
  updateApplication
} from "../utils/applicationStorage";

import "./ApplicationHistory.css";

function ApplicationHistory({
  application,
  onApplicationUpdate
}) {
  const [openHistory, setOpenHistory] =
    useState(false);

  const [currentTime, setCurrentTime] =
    useState(new Date());

  const [soundEnabled, setSoundEnabled] =
    useState(() => {
      const saved =
        localStorage.getItem(
          "applicationSoundEnabled"
        );

      return saved === null
        ? true
        : saved === "true";
    });

  const [soundVolume, setSoundVolume] =
    useState(() => {
      const saved =
        localStorage.getItem(
          "applicationSoundVolume"
        );

      return saved === null
        ? 0.5
        : Number(saved);
    });

  const [previousVolume, setPreviousVolume] =
    useState(() => {
      const saved =
        localStorage.getItem(
          "applicationPreviousVolume"
        );

      return saved === null
        ? 0.5
        : Number(saved);
    });

  const [notification, setNotification] =
    useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "applicationSoundEnabled",
      soundEnabled
    );
  }, [soundEnabled]);

  useEffect(() => {
    localStorage.setItem(
      "applicationSoundVolume",
      soundVolume
    );
  }, [soundVolume]);

  useEffect(() => {
    localStorage.setItem(
      "applicationPreviousVolume",
      previousVolume
    );
  }, [previousVolume]);

  function getStatusClass(status) {
    if (status === "Applied") {
      return "status-applied";
    }

    if (status === "Under Review") {
      return "status-under-review";
    }

    if (status === "Shortlisted") {
      return "status-shortlisted";
    }

    if (status === "Rejected") {
      return "status-rejected";
    }

    return "";
  }

  function getStatusIcon(status) {
    if (status === "Applied") {
      return "●";
    }

    if (status === "Under Review") {
      return "◐";
    }

    if (status === "Shortlisted") {
      return "✓";
    }

    if (status === "Rejected") {
      return "✕";
    }

    return "";
  }

  function getStatusProgress(status) {
    if (status === "Applied") {
      return 25;
    }

    if (status === "Under Review") {
      return 50;
    }

    if (status === "Shortlisted") {
      return 75;
    }

    if (status === "Rejected") {
      return 100;
    }

    return 0;
  }

  function getStatusStage(status) {
    if (status === "Applied") {
      return "Application Submitted";
    }

    if (status === "Under Review") {
      return "Application Being Reviewed";
    }

    if (status === "Shortlisted") {
      return "Candidate Shortlisted";
    }

    if (status === "Rejected") {
      return "Application Closed";
    }

    return "Unknown Stage";
  }

  function getStatusDescription(status) {
    if (status === "Applied") {
      return "Your application has been submitted.";
    }

    if (status === "Under Review") {
      return "The company is currently reviewing your application.";
    }

    if (status === "Shortlisted") {
      return "You have been shortlisted for the next stage.";
    }

    if (status === "Rejected") {
      return "The company has closed this application.";
    }

    return "";
  }

  function getTimeAgo(date) {
    if (!date) {
      return "";
    }

    const difference =
      currentTime.getTime() -
      new Date(date).getTime();

    const seconds = Math.floor(
      difference / 1000
    );

    if (seconds < 60) {
      return `${seconds} second${
        seconds === 1 ? "" : "s"
      } ago`;
    }

    const minutes = Math.floor(
      seconds / 60
    );

    if (minutes < 60) {
      return `${minutes} minute${
        minutes === 1 ? "" : "s"
      } ago`;
    }

    const hours = Math.floor(
      minutes / 60
    );

    if (hours < 24) {
      return `${hours} hour${
        hours === 1 ? "" : "s"
      } ago`;
    }

    const days = Math.floor(
      hours / 24
    );

    return `${days} day${
      days === 1 ? "" : "s"
    } ago`;
  }

  function getCurrentStatusDuration() {
    if (!application.statusUpdatedAt) {
      return "Not available";
    }

    const difference =
      currentTime.getTime() -
      new Date(
        application.statusUpdatedAt
      ).getTime();

    const minutes = Math.floor(
      difference / 1000 / 60
    );

    if (minutes < 1) {
      return "Less than a minute";
    }

    if (minutes < 60) {
      return `${minutes} minute${
        minutes === 1 ? "" : "s"
      }`;
    }

    const hours = Math.floor(
      minutes / 60
    );

    if (hours < 24) {
      return `${hours} hour${
        hours === 1 ? "" : "s"
      }`;
    }

    const days = Math.floor(
      hours / 24
    );

    return `${days} day${
      days === 1 ? "" : "s"
    }`;
  }

  function getStatusDuration(
    history,
    index
  ) {
    if (!history[index + 1]) {
      return null;
    }

    const currentDate =
      new Date(
        history[index].changedAt
      );

    const nextDate =
      new Date(
        history[index + 1].changedAt
      );

    const difference =
      currentDate.getTime() -
      nextDate.getTime();

    const minutes = Math.floor(
      difference / 1000 / 60
    );

    if (minutes < 1) {
      return "Less than a minute";
    }

    if (minutes < 60) {
      return `${minutes} minute${
        minutes === 1 ? "" : "s"
      }`;
    }

    const hours = Math.floor(
      minutes / 60
    );

    if (hours < 24) {
      return `${hours} hour${
        hours === 1 ? "" : "s"
      }`;
    }

    const days = Math.floor(
      hours / 24
    );

    return `${days} day${
      days === 1 ? "" : "s"
    }`;
  }

  function playNotificationSound() {
    if (
      !soundEnabled ||
      soundVolume === 0
    ) {
      return;
    }

    const audio = new Audio(
      "/notification.mp3"
    );

    audio.volume = soundVolume;

    audio.play().catch(() => {});
  }

  function handleSoundToggle() {
    if (soundEnabled) {
      if (soundVolume > 0) {
        setPreviousVolume(
          soundVolume
        );
      }

      setSoundVolume(0);
      setSoundEnabled(false);

      return;
    }

    const restoredVolume =
      previousVolume > 0
        ? previousVolume
        : 0.5;

    setSoundVolume(
      restoredVolume
    );

    setSoundEnabled(true);
  }

  function handleVolumeChange(event) {
    const volume = Number(
      event.target.value
    );

    setSoundVolume(volume);

    if (volume === 0) {
      setSoundEnabled(false);
      return;
    }

    setPreviousVolume(volume);
    setSoundEnabled(true);
  }

  function handleTestSound() {
    playNotificationSound();
  }

  function handleStatusChange(
    newStatus
  ) {
    if (
      !application ||
      application.status === newStatus
    ) {
      return;
    }

    const oldStatus =
      application.status;

    const changedAt =
      new Date().toISOString();

    const history =
      Array.isArray(
        application.statusHistory
      )
        ? application.statusHistory
        : [];

    const updatedHistory = [
      {
        from: oldStatus,
        to: newStatus,
        changedAt
      },
      ...history
    ];

    updateApplication(
      application.id,
      {
        status: newStatus,
        statusUpdatedAt:
          changedAt,
        statusHistory:
          updatedHistory
      }
    );

    if (
      newStatus === "Shortlisted" ||
      newStatus === "Rejected"
    ) {
      playNotificationSound();
    }

    setNotification(
      `Status changed to ${newStatus}`
    );

    setTimeout(() => {
      setNotification("");
    }, 3000);

    if (onApplicationUpdate) {
      onApplicationUpdate();
    }
  }

  function handleClearHistory() {
    const confirmed =
      window.confirm(
        `Clear all status history for ${application.jobTitle}?`
      );

    if (!confirmed) {
      return;
    }

    updateApplication(
      application.id,
      {
        statusHistory: []
      }
    );

    if (onApplicationUpdate) {
      onApplicationUpdate();
    }
  }

  if (!application) {
    return null;
  }

  const history =
    Array.isArray(
      application.statusHistory
    )
      ? application.statusHistory
      : [];

  const statusProgress =
    getStatusProgress(
      application.status
    );

  return (
    <div className="application-history-container">
      <div className="application-history-header">
        <h2>
          Application History
        </h2>

        <div className="application-history-count">
          {history.length} Status Changes
        </div>
      </div>

      <div className="notification-header">
        <div className="notification-title">
          <span>
            🔔 Notifications
          </span>

          {notification && (
            <span className="notification-count">
              1
            </span>
          )}
        </div>

        <div className="notification-controls">
          <button
            type="button"
            className={
              soundEnabled
                ? "sound-toggle sound-on"
                : "sound-toggle sound-off"
            }
            onClick={
              handleSoundToggle
            }
          >
            {soundEnabled
              ? "🔊 Sound On"
              : "🔇 Sound Off"}
          </button>

          <span className="volume-value">
            {Math.round(
              soundVolume * 100
            )}
            %
          </span>

          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={soundVolume}
            onChange={
              handleVolumeChange
            }
          />

          <button
            type="button"
            className="test-sound-button"
            onClick={
              handleTestSound
            }
            disabled={
              !soundEnabled ||
              soundVolume === 0
            }
          >
            🔊 Test Sound
          </button>
        </div>
      </div>

      {notification && (
        <div className="notifications-container">
          <div className="status-notification">
            <div className="notification-message">
              <strong>
                {application.jobTitle}
              </strong>

              <span>
                {notification}
              </span>

              <small>
                Just now
              </small>
            </div>

            <button
              type="button"
              onClick={() =>
                setNotification("")
              }
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="application-details">
        <div>
          <strong>
            Salary
          </strong>

          <span>
            {application.salary ||
              "Not specified"}
          </span>
        </div>

        <div>
          <strong>
            Applied
          </strong>

          <span>
            {new Date(
              application.appliedAt
            ).toLocaleString()}
          </span>
        </div>

        <div>
          <strong>
            Current Status
          </strong>

          <span>
            {application.status}
          </span>
        </div>

        <div>
          <strong>
            Status Duration
          </strong>

          <span>
            {getCurrentStatusDuration()}
          </span>
        </div>
      </div>

      <div className="status-control-section">
        <label>
          Change Status
        </label>

        <select
          value={application.status}
          onChange={(event) =>
            handleStatusChange(
              event.target.value
            )
          }
        >
          <option value="Applied">
            Applied
          </option>

          <option value="Under Review">
            Under Review
          </option>

          <option value="Shortlisted">
            Shortlisted
          </option>

          <option value="Rejected">
            Rejected
          </option>
        </select>
      </div>

      <div className="status-stage-section">
        <div className="status-stage-header">
          <strong>
            Application Progress
          </strong>

          <span>
            {statusProgress}%
          </span>
        </div>

        <div className="status-stage-progress">
          <div
            className={`status-stage-progress-fill ${getStatusClass(
              application.status
            )}`}
            style={{
              width: `${statusProgress}%`
            }}
          />
        </div>

        <div className="status-stages">
          {[
            "Applied",
            "Under Review",
            "Shortlisted",
            "Rejected"
          ].map(
            (status, index) => (
              <div
                key={status}
                className={`status-stage ${
                  getStatusProgress(
                    application.status
                  ) >=
                  getStatusProgress(
                    status
                  )
                    ? "stage-active"
                    : ""
                }`}
              >
                <span
                  className={`stage-dot ${getStatusClass(
                    status
                  )}`}
                />

                <span>
                  {status}
                </span>

                {index < 3 && (
                  <span
                    className={`stage-line ${
                      getStatusProgress(
                        application.status
                      ) >
                      getStatusProgress(
                        status
                      )
                        ? "line-active"
                        : ""
                    }`}
                  />
                )}
              </div>
            )
          )}
        </div>
      </div>

      <div
        className={`status-description ${getStatusClass(
          application.status
        )}`}
      >
        <span>
          {getStatusIcon(
            application.status
          )}
        </span>

        <div>
          <strong>
            {getStatusStage(
              application.status
            )}
          </strong>

          <p>
            {getStatusDescription(
              application.status
            )}
          </p>
        </div>
      </div>

      <div className="current-status-duration">
        <span className="live-dot" />

        <span>
          Current status for{" "}
          {getCurrentStatusDuration()}
        </span>

        {application.statusUpdatedAt && (
          <span>
            Started:{" "}
            {new Date(
              application.statusUpdatedAt
            ).toLocaleString()}
          </span>
        )}
      </div>

      <div className="status-changes-summary">
        <div>
          <strong>
            Status Changes
          </strong>

          <span>
            {history.length}
          </span>
        </div>

        <div>
          <span
            className={`status-summary-dot ${getStatusClass(
              application.status
            )}`}
          />

          <span>
            Current Status:{" "}
            {application.status}
          </span>
        </div>
      </div>

      <div className="history-controls">
        <button
          type="button"
          className={
            openHistory
              ? "history-toggle-button history-open"
              : "history-toggle-button"
          }
          onClick={() =>
            setOpenHistory(
              (value) => !value
            )
          }
        >
          <span>
            {openHistory
              ? "Hide History"
              : "Show History"}
          </span>

          <span
            className={
              openHistory
                ? "history-arrow arrow-open"
                : "history-arrow"
            }
          >
            ↓
          </span>

          <span className="history-count-badge">
            {history.length}
          </span>
        </button>
      </div>

      {openHistory && (
        <div className="history-content">
          {history.length === 0 ? (
            <div className="no-history-message">
              <p>
                No status history
                available.
              </p>
            </div>
          ) : (
            <div className="history-timeline">
              {history.map(
                (
                  historyItem,
                  index
                ) => {
                  const isLatest =
                    index === 0;

                  return (
                    <div
                      key={`${historyItem.changedAt}-${index}`}
                      className={
                        isLatest
                          ? "history-item latest-history"
                          : "history-item"
                      }
                    >
                      <div className="history-timeline-marker">
                        <span
                          className={`history-dot ${getStatusClass(
                            historyItem.to
                          )}`}
                        >
                          {getStatusIcon(
                            historyItem.to
                          )}
                        </span>

                        {index <
                          history.length -
                            1 && (
                          <span className="history-timeline-line" />
                        )}
                      </div>

                      <div className="history-item-content">
                        <div className="history-item-header">
                          <span
                            className={`history-status-badge ${getStatusClass(
                              historyItem.to
                            )}`}
                          >
                            {historyItem.to}
                          </span>

                          {isLatest && (
                            <span className="latest-badge">
                              Latest
                            </span>
                          )}
                        </div>

                        <div className="history-change">
                          <span>
                            {historyItem.from}
                          </span>

                          <span className="history-arrow-right">
                            →
                          </span>

                          <span>
                            {historyItem.to}
                          </span>
                        </div>

                        <p className="history-direction">
                          Status changed
                        </p>

                        <p className="history-date">
                          {new Date(
                            historyItem.changedAt
                          ).toLocaleString()}
                        </p>

                        <p className="history-time-ago">
                          {getTimeAgo(
                            historyItem.changedAt
                          )}
                        </p>

                        {getStatusDuration(
                          history,
                          index
                        ) && (
                          <p className="history-duration">
                            Time in previous
                            status:{" "}
                            {getStatusDuration(
                              history,
                              index
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}

          <button
            type="button"
            className="clear-history-button"
            disabled={
              history.length === 0
            }
            onClick={
              handleClearHistory
            }
          >
            Clear History
          </button>
        </div>
      )}
    </div>
  );
}

export default ApplicationHistory;