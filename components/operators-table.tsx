"use client"

import useSWR from "swr"

import Link from "next/link"

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

import { Badge } from "@/components/ui/badge"

import { ExternalLink, Users, ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"

import { apiClient } from "@/lib/api"

import { OperatorSummary, Pagination } from "@/lib/api" // Use correct import from lib/api

import { useState } from "react"



const operatorsFetcher = (url: string) => apiClient.getOperatorsSummary(url);



export function OperatorsTable() {

    const [page, setPage] = useState(1)

    const { data: response, isLoading, error } = useSWR(`/operators/summary?page=${page}&limit=10`, operatorsFetcher, {

        refreshInterval: 60000 // Refresh every minute

    })



    const operators = response?.data

    const pagination = response?.pagination



    const handlePrev = () => setPage(p => Math.max(1, p - 1))

    const handleNext = () => setPage(p => pagination && p < Math.ceil(pagination.total / pagination.limit) ? p + 1 : p)



    if (isLoading && !operators) {

        return (

            <Card>

                <CardHeader>

                    <CardTitle>pNode Operators</CardTitle>

                    <CardDescription>Managers and their pNode holdings</CardDescription>

                </CardHeader>

                <CardContent>

                    <div className="h-48 flex items-center justify-center">

                        Loading operators...

                    </div>

                </CardContent>

            </Card>

        )

    }



    if (error) {

        return (

            <Card>

                <CardHeader>

                    <CardTitle>pNode Operators</CardTitle>

                    <CardDescription>Managers and their pNode holdings</CardDescription>

                </CardHeader>

                <CardContent>

                    <div className="text-destructive">Failed to load operators: {error.message}</div>

                </CardContent>

            </Card>

        )

    }



    return (

        <Card>

            <CardHeader>

                <div className="flex items-center gap-2">

                    <Users className="w-5 h-5 text-primary" />

                    <CardTitle>pNode Operators</CardTitle>

                </div>

                <CardDescription>Managers and their pNode holdings on the Xandeum network.</CardDescription>

            </CardHeader>

            <CardContent>

                <div className="overflow-x-auto">

                    <Table>

                        <TableHeader>

                            <TableRow>

                                <TableHead className="w-[150px]">Manager</TableHead>

                                <TableHead>Total pNodes</TableHead>

                                <TableHead>Registered</TableHead>

                                <TableHead>Details</TableHead>

                            </TableRow>

                        </TableHeader>

                        <TableBody>

                            {operators?.map((operator, index) => (

                                <TableRow key={operator.managerPubkey}>

                                    <TableCell className="font-mono text-xs max-w-[150px] truncate">

                                        <Link href={`https://solscan.io/account/${operator.managerPubkey}`} target="_blank" rel="noopener noreferrer" className="hover:underline text-primary">

                                            {operator.managerPubkey} <ExternalLink className="w-3 h-3 inline-block ml-1" />

                                        </Link>

                                    </TableCell>

                                    <TableCell>{operator.totalPNodes}</TableCell>

                                    <TableCell>{operator.registeredPNodes}</TableCell>

                                    <TableCell>

                                        <div className="flex flex-wrap gap-1">

                                            {operator.pNodeIDs.slice(0, 3).map(id => (

                                                <Link key={id} href={`/pnodes/${id}`} target="_blank" rel="noopener noreferrer">

                                                    <Badge variant="outline" className="text-xs">

                                                        {id.slice(0, 4)}...

                                                        <ExternalLink className="w-2.5 h-2.5 inline-block ml-1" />

                                                    </Badge>

                                                </Link>

                                            ))}

                                            {operator.pNodeIDs.length > 3 && (

                                                <Badge variant="outline" className="text-xs">

                                                    +{operator.pNodeIDs.length - 3} more

                                                </Badge>

                                            )}

                                        </div>

                                    </TableCell>

                                </TableRow>

                            ))}

                        </TableBody>

                    </Table>

                </div>

            </CardContent>

             {pagination && pagination.total > pagination.limit && (

                <CardFooter className="flex items-center justify-between">

                    <div className="text-sm text-muted-foreground">

                        Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)}

                    </div>

                    <div className="flex gap-2">

                        <Button variant="outline" size="sm" onClick={handlePrev} disabled={pagination.page === 1}>

                            <ChevronLeft className="w-4 h-4 mr-2" /> Previous

                        </Button>

                        <Button variant="outline" size="sm" onClick={handleNext} disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}>

                            Next <ChevronRight className="w-4 h-4 ml-2" />

                        </Button>

                    </div>

                </CardFooter>

            )}

        </Card>

    )

}
