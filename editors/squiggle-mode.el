;;; squiggle-mode.el --- major mode for editing Squiggle code. -*- coding: utf-8; lexical-binding: t; -*-

;; Copyright © 2021, by kfirmanty

;; Author: Karol Firmanty
;; Version: 9.0.1
;; Created: 10 Dec 2021
;; Keywords: languages
;; Homepage: https://github.com/kfirmanty/squiggle

;; This file is not part of GNU Emacs.

;;; License:

;; You can redistribute this program and/or modify it under the terms of the GNU General Public License version 2.

;;; Commentary:

;; squiggle mode - color highlight

;;; Code:
(setq squiggle-font-lock-keywords
      (let* (
             (x-keywords '("width" "height" "blendingMode" "squiggles" "code"))
             (x-variables '("x" "y" "t"))
             (x-constants '("ADDITIVE" "SUBTRACTIVE" "MULT" "DIV"))
             (x-functions '("+" "-" "*" "/"
                            ">" "<" ">=" "<=" "="
                            "if" "%" "set"
                            "add" "sub" "mult" "div"
                            "sin" "dup" "dist" "dir"))

             (x-variables-regexp (regexp-opt x-variables 'words))
             (x-keywords-regexp (regexp-opt x-keywords 'words))
             (x-constants-regexp (regexp-opt x-constants 'words))
             (x-functions-regexp (regexp-opt x-functions 'words)))

        `(
          (,x-keywords-regexp . 'font-lock-keyword-face)
          (,x-constants-regexp . 'font-lock-constant-face)
          (,x-functions-regexp . 'font-lock-function-name-face)
          (,x-variables-regexp . 'font-lock-variable-name-face)
          ("[+-]?[0-9]+" . 'font-lock-constant-face)
          ("\"" . 'font-lock-string-face))))

;;;###autoload
(define-derived-mode squiggle-mode fundamental-mode "squiggle mode"
  "Major mode for editing Squiggle code"

  ;; code for syntax highlighting
  (setq font-lock-defaults '((squiggle-font-lock-keywords) font-lock-keywords-only)))

;; add the mode to the `features' list
(provide 'squiggle-mode)

;;; squiggle-mode.el ends here
