import styled from '@emotion/styled';
import React, { useMemo } from 'react';
import { SmolFormFactoryProps, MinPropsToBind } from './types';

export default function SmolFormFactory<
    Entity,
    R extends MinPropsToBind,
>({
    entity,
    errors,
    onChange: changeHandler,
    form,
    formFields,
    bind,
    top,
    bottom,
    elements,
}: SmolFormFactoryProps<Entity, R>) {
    const questionnaire = useMemo(() => {
        if (form) {
            const args = {
                entity, errors, bind, changeHandler,
            };

            return (
                <>
                    {top}
                    {form(args)}
                    {bottom}
                </>
            );
        }
        return null;
    }, [form, top, entity, errors, bind, changeHandler, bottom]);

    const wrapperEl = useMemo(() => {
        if (elements?.wrapper) {
            const { className, ...props } = elements?.wrapper.props;

            return {
                props,
                Type: elements?.wrapper.type,
                className,
            };
        }

        return {
            Type: Grid,
            props: {},
        };
    }, [elements?.wrapper]);

    const cellEl = useMemo(() => {
        if (elements?.cell) {
            const { className, ...props } = elements?.cell.props;

            return {
                props,
                Type: elements?.cell.type,
                className,
            };
        }

        return {
            Type: GridCell,
            props: {},
        };
    }, [elements?.cell]);

    const topEl = useMemo(() => {
        if (elements?.top) {
            const { className, ...props } = elements?.top.props;

            return {
                props,
                Type: elements?.top.type,
                className,
            };
        }

        return {
            Type: GridRow,
            props: {},
        };
    }, [elements?.top]);

    const bottomEl = useMemo(() => {
        if (elements?.bottom) {
            const { className, ...props } = elements?.bottom.props;

            return {
                props,
                Type: elements?.bottom.type,
                className,
            };
        }

        return {
            Type: GridRow,
            props: {},
        };
    }, [elements?.bottom]);

    const questionnaireFields = useMemo(() => formFields && (
        <wrapperEl.Type
            {...wrapperEl.props}
            className={`smol-forms_grid-wrapper ${wrapperEl.className || ''}`}
        >
            {/* Top section */}
            {
                top && (
                    <topEl.Type
                        {...topEl.props}
                        className={`smol-forms_grid-row smol-forms_grid-top ${topEl.className || ''}`}
                    >
                        {top}
                    </topEl.Type>
                )
            }
            {/* Meaty section */}
            {
                formFields({
                    entity, errors, bind, changeHandler,
                }).filter((field) => field)
                    .map((field) => (
                        <cellEl.Type
                            {...cellEl.props}
                            key={field.props['data-key']}
                            className={`smol-forms_grid-field-cell ${cellEl.className || ''}`}
                        >
                            {field}
                        </cellEl.Type>
                    ))
            }
            {/* Bottom section */}
            {
                bottom && (
                    <bottomEl.Type
                        {...bottomEl.props}
                        className={
                            `smol-forms_grid-row smol-forms_grid-bottom ${bottomEl.className || ''}`
                        }
                    >
                        {bottom}
                    </bottomEl.Type>
                )
            }
        </wrapperEl.Type>
    ), [
        formFields,
        wrapperEl,
        top,
        topEl,
        entity,
        errors,
        bind,
        changeHandler,
        bottom,
        bottomEl,
        cellEl,
    ]);

    const neither = !form && !formFields;
    const both = form && formFields;

    if (neither || both) {
        throw new Error('You need to provide either a form component on the "form" property, OR a collection of fields on the "formFields"!');
    }

    return (questionnaire || questionnaireFields);
}

const Grid = styled('div')`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    box-sizing: border-box;
`;

const GridRow = styled('div')`
    padding: 0;
    margin: 0;
    flex-basis: 100%;
    flex-grow: 0;
    max-width: 100%;
`;

const GridCell = styled('div')`
    padding: 0;
    margin: 0;
    flex-basis: 50%;
    flex-grow: 0;
    max-width: 50%;
    
    padding-left: 16px;
    padding-top: 16px;
`;
