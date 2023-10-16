import configparser
import sys
from configparser import SectionProxy, MissingSectionHeaderError
import argparse


class CustomConfigParser(configparser.ConfigParser):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.errors = []
        self.option_values = {}  # Maps options to their values and the places they were found
        self.option_lines = {}

    def _read(self, fp, fpname):  # noqa: C901
        elements_added = set()
        cursect = None
        sectname = None
        optname = None
        # lineno = 0
        indent_level = 0
        e = None

        for lineno, line in enumerate(fp, start=1):
            comment_start = sys.maxsize
            inline_prefixes = dict((p, -1) for p in self._inline_comment_prefixes)

            while comment_start == sys.maxsize and inline_prefixes:
                next_prefixes = {}
                for prefix, index in inline_prefixes.items():
                    index = line.find(prefix, index + 1)
                    if index == -1:
                        continue
                    next_prefixes[prefix] = index
                    if index == 0 or (index > 0 and line[index - 1].isspace()):
                        comment_start = min(comment_start, index)
                inline_prefixes = next_prefixes

            for prefix in self._comment_prefixes:
                if line.strip().startswith(prefix):
                    comment_start = 0
                    break

            if comment_start == sys.maxsize:
                comment_start = None
            value = line[:comment_start].strip()

            if not value:
                if self._empty_lines_in_values:
                    if comment_start is None and cursect is not None and optname and cursect[optname] is not None:
                        if isinstance(cursect[optname], list):
                            cursect[optname].append('')
                        else:
                            cursect[optname] = [cursect[optname], '']
                else:
                    indent_level = sys.maxsize
                continue

            first_nonspace = self.NONSPACECRE.search(line)
            cur_indent_level = first_nonspace.start() if first_nonspace else 0

            if cursect is not None and optname and cur_indent_level > indent_level:
                cursect[optname].append(value)
            else:
                indent_level = cur_indent_level
                mo = self.SECTCRE.match(value)

                if mo:
                    sectname = mo.group('header')
                    if sectname in self._sections:
                        if self._strict and (sectname, optname) in elements_added:
                            error_msg = f"Warning: Duplicated option '{optname}' in section '{sectname}' in {fpname} at line {lineno}."
                            self.errors.append(error_msg)
                        cursect = self._sections[sectname]
                        elements_added.add(sectname)
                    elif sectname == self.default_section:
                        cursect = self._defaults
                    else:
                        cursect = self._dict()
                        self._sections[sectname] = cursect
                        self._proxies[sectname] = SectionProxy(self, sectname)
                        elements_added.add(sectname)
                    optname = None
                elif cursect is None:
                    raise MissingSectionHeaderError(fpname, lineno, line)
                else:
                    mo = self._optcre.match(value)
                    if mo:
                        optname, vi, optval = mo.group('option', 'vi', 'value')
                        if not optname:
                            e = self._handle_error(e, fpname, lineno, line)
                        optname = self.optionxform(optname.rstrip())
                        if (sectname, optname) not in self.option_lines:
                            self.option_lines[(sectname, optname)] = lineno
                        if self._strict and (sectname, optname) in elements_added:
                            duplicated_value = cursect[optname]
                            # If is a list, we get the first
                            if isinstance(duplicated_value, list):
                                duplicated_value = duplicated_value[0]
                            error_msg = (f"Warning: Duplicated option '{optname}' with value '{duplicated_value}' "
                                         f"in section '{sectname}' in {fpname} at line {lineno}.")
                            print(error_msg)
                        elements_added.add((sectname, optname))

                        if optval is not None:
                            optval = optval.strip()

                            # Dup verification
                            if optname in cursect:
                                error_msg = (f"Warning: Duplicated option '{optname}' with value '{optval}' "
                                             f"in section '{sectname}' in {fpname} at line {lineno}.")
                                self.errors.append(error_msg)
                            cursect[optname] = optval
                        else:
                            cursect[optname] = None
                    else:
                        e = self._handle_error(e, fpname, lineno, line)

        self._join_multiline_values()


def detect_duplicate_variables(files):
    all_options = {}  # {option: (value, section, file, line)}
    all_errors = []

    for file_path in files:
        config = CustomConfigParser()
        config.read(file_path)

        # Add errors to a single file
        all_errors.extend(config.errors)

        for section, options in config._sections.items():
            for option, values in options.items():
                value = values if not isinstance(values, list) else values[0]

                if option in all_options:
                    prev_value, prev_section, prev_file, prev_line = all_options[option]
                    if prev_value != value:
                        error_msg = (f"Warning: Option '{option}' has a conflicting value. "
                                     f"Previous: '{prev_value}' in section '{prev_section}' of {prev_file} at line {prev_line}. "
                                     f"Current: '{value}' in section '{section}' of {file_path}.")
                        all_errors.append(error_msg)
                else:
                    all_options[option] = (value, section, file_path, config.option_lines.get((section, option), None))

    return all_errors


def main():
    # Parse arguments
    parser = argparse.ArgumentParser(description='Detect duplicated options in INI files.')
    parser.add_argument('files', metavar='F', type=str, nargs='+',
                        help='A list of files to be processed')

    args = parser.parse_args()

    # Detect duplicate options for each file
    warnings = detect_duplicate_variables(args.files)
    for warning in warnings:
        print(warning)


if __name__ == "__main__":
    main()
