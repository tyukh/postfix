/* transform.ts
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 * SPDX-FileCopyrightText: 2022 Roman Tyukh
 *
 */

'use strict';

import {API, FileInfo} from 'jscodeshift';
import {ExpressionKind} from 'ast-types/gen/kinds';
import * as TransformMap from './transform.map';

export const parser = 'ts';

function exportFunctions(source: string, api: API): string {
  const j = api.jscodeshift;
  const root = j(source);

  root.find(j.FunctionDeclaration).forEach((path) => {
    if (path.parentPath.value.type === 'ExportNamedDeclaration')
      j(path.parentPath).replaceWith(path.node);
  });

  return root.toSource();
}

function exportVariables(source: string, api: API): string {
  const j = api.jscodeshift;
  const root = j(source);

  root.find(j.VariableDeclaration).forEach((path) => {
    if (path.parentPath.value.type === 'ExportNamedDeclaration') {
      if (path.node.kind !== 'var') path.node.kind = 'var';
      j(path.parentPath).replaceWith(path.node);
    }
  });

  return root.toSource();
}

function urlToImportsExpression(api: API, url: string, object = ''): ExpressionKind {
  const j = api.jscodeshift;

  let imports = TransformMap.conversion.get(url.trim());
  if (imports === undefined) {
    imports = 'misc/extensionUtils/getCurrentExtension()/imports/' + url.trim().replace('./', '');
  }

  const parts = imports.split('/');
  if (object !== '') parts.push(object);

  let ast: ExpressionKind = j.identifier('imports');
  parts.forEach((part) => (ast = j.memberExpression(ast, j.identifier(part.toString()))));

  return ast;
}

function importDeclarations(source: string, api: API): string {
  const j = api.jscodeshift;
  const root = j(source);

  root.find(j.ImportDeclaration).forEach((path) => {
    path.node.specifiers?.forEach((specifier) => {
      let ast;
      switch (specifier.type) {
        case 'ImportSpecifier':
        case 'ImportDefaultSpecifier':
          ast = j.variableDeclarator(
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            specifier.local!,
            urlToImportsExpression(
              api,
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
              path.node.source.value?.toString()!,
              specifier.local?.name
            )
          );
          break;
        case 'ImportNamespaceSpecifier':
          ast = j.variableDeclarator(
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            specifier.local!,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
            urlToImportsExpression(api, path.node.source.value?.toString()!)
          );
          break;
      }
      path.insertBefore(j.variableDeclaration('const', [ast]));
    });
    path.prune();
  });

  return root.toSource();
}

export default function transformer(file: FileInfo, api: API): string {
  let source: string = file.source;

  source = exportFunctions(source, api);
  source = exportVariables(source, api);
  source = importDeclarations(source, api);

  return source;
}
