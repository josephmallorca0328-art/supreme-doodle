document.addEventListener("DOMContentLoaded", () => {
  const avatarPicker = document.getElementById("avatarPicker");
  const avatarOptions = avatarPicker.querySelectorAll(".avatar-option");
  const selectedAvatarInput = document.getElementById("selectedAvatarInput");
  const enterForm = document.getElementById("enterForm");
  const usernameInput = document.getElementById("username");
  const formGroup = usernameInput.closest(".form-group");

  // Avatar Selection Logic
  avatarOptions.forEach((option) => {
    option.addEventListener("click", () => {
      // Remove selected class from all options
      avatarOptions.forEach((opt) => opt.classList.remove("selected"));

      // Add selected class to clicked option
      option.classList.add("selected");

      // Update hidden input value
      const chosenAvatar = option.getAttribute("data-avatar");
      selectedAvatarInput.value = chosenAvatar;
    });
  });

  // Clear validation error on typing
  usernameInput.addEventListener("input", () => {
    if (formGroup.classList.contains("has-error")) {
      formGroup.classList.remove("has-error");
    }
  });

  // Form Validation Logic
  enterForm.addEventListener("submit", (event) => {
    const usernameValue = usernameInput.value.trim();

    if (!usernameValue) {
      event.preventDefault(); // Stop form submission
      formGroup.classList.add("has-error");
      usernameInput.focus();
    }
  });
});